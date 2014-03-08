'''
A server that listens to stomp queue for messages to email.

The message should consist of a json dictionary with the following keys:
recipients=['email address'] 
subject
body
imagefilepath (optional)

Requires a config file that looks like:

[smtp]
sender = my service <noreply@example.org>
host = localhost
port = 993
#optional:
use_tls = true
username = foo
password = xxx

#optional:
[stomp]
hosts = localhost:61613, backuphost:61613
queuename = /queue/emailspool
'''

import stomp
import time
import json
import logging
import smtplib

class SingleThreadedStompConnection(stomp.Connection):
    '''
    Note that the client can only send requests and then can only receive them.
    This, for example, limits the use of the 'receipt' header.
    '''
    def connect(self, headers={}, **keyword_headers):
        if not self.is_connected():
            self._Connection__running = True
            self._Connection__attempt_connection()
        return super(SingleThreadedStompConnection, self).connect(headers, 
                                                        **keyword_headers)

    def listen(self):
        '''
        run forever in current thread
        '''
        self._Connection__running = True
        self._Connection__receiver_loop()

class StompEmailAlertReceiver(object):

    maxtimeout = 60 * 60 * 24 * 1 #1 day, log base 2 ~= 16
    initialTimeout = 2 #in seconds

    def __init__(self, config, queueName):
        self.config = config
        self.queueName = queueName
    
    def runStompListener(self, hosts, clientid):
        """
        Connect to the stomp server and subscribe to the replication topic
        """
        #self.log.info("connecting to %r" % hosts)
        self.conn = conn = SingleThreadedStompConnection(hosts)
        conn.set_listener('', self)
        conn.connect(headers={'client-id':clientid})
        conn.subscribe(destination = self.queueName, ack='client')
        log.info('listening on %s' % self.queueName)
        print 'listening on', self.queueName
        conn.listen() #run forever in current thread

    def on_message(self, headers, message):
        msg = json.loads(message)
        log.debug('receving msg %s', msg)
        timeout = self.initialTimeout
        while True:
            try:
                self.postMsg(**msg)
                break
            except smtplib.SMTPRecipientsRefused:
                log.error('dropping email, recipients refused: %s', msg[0])
                break
            except smtplib.SMTPException, IOError:
                timeout *= 2 #expontial backoff
                if timeout >= self.maxtimeout:
                    log.error('giving up sending email: %s', msg, exc_info=True)                    
                    break
                else: 
                    log.warning('re-queueing email due to exception', exc_info=True)
                    time.sleep(timeout)
        self.conn.ack({'message-id' : headers[ 'message-id' ]})

    def postMsg(self, recipients=(), subject='', body='', imagefilepath=None):
        '''
        send mail right away
        '''
        log.info('sending mail %s to %s' % (subject, str(recipients)))
        mimebody = self.buildMimeMsg(self.config.sender, recipients, subject, body, imagefilepath)
        self.sendMail(recipients, mimebody)

    def buildMimeMsg(self, sender, recipients, subject, body, imagefilepath=None):
        from email.mime.text import MIMEText
        from email.mime.image import MIMEImage
        from email.mime.multipart import MIMEMultipart

        #hardcode boundary for testing
        outer = MIMEMultipart(boundary="===============0491338693==")
        outer['To'] = ', '.join(recipients)
        outer['From'] = sender
        outer['Subject'] = subject
        outer.preamble = 'You will not see this in a MIME-aware mail reader.\n'

        outer.attach(MIMEText(body, 'html'))

        if imagefilepath:
            fp = open(imagefilepath, 'rb')
            img = MIMEImage(fp.read())
            fp.close()
            outer.attach(img)
        return outer

    def sendMail(self, recipients, mimebody):
        log.debug('sending to %s', str(recipients))
        s = smtplib.SMTP(self.config.host, int(self.config.port))
        s.ehlo()
        try:
            if self.config.get('use_tls'):
                s.starttls()
                s.ehlo()
            if 'username' in self.config: 
                s.login(self.config.username, self.config.password)
            s.sendmail(self.config.sender, recipients, mimebody.as_string())
        finally:
            s.close()

if __name__ == '__main__': 
    import ConfigParser
    import sys
    from vesper.utils import attrdict
    import logging.config
    
    config = ConfigParser.RawConfigParser(dict(use_tls='true', 
        hosts='localhost:61613', queuename = '/queue/emailspool'))
    if len(sys.argv) < 2:
        print 'missing config file argument'
        sys.exit(-1)
    config.read(sys.argv[1])
    configdict = attrdict(config.items('smtp'))
    configdict.use_tls = config.getboolean('smtp', 'use_tls')
    
    hosts = config.get('stomp', 'hosts')
    def splitAddr(hostport): 
        a, b = hostport.strip().split(':',1)
        return a, int(b)
    hosts = [splitAddr(hostport) for hostport in hosts.split(',')]
    clientid = 'emailer'
    logging.config.fileConfig(sys.argv[1])
    log = logging.getLogger("emailer")
    emailSender = StompEmailAlertReceiver(configdict, config.get('stomp', 'queuename'))
    emailSender.runStompListener(hosts, clientid)
