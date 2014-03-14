#!/usr/bin/env python
'''
Run the ocpool contest
'''
import random
import operator

class Entry(object):
  def __init__(self, proposal, min=0, max=0, endorsements=0, earnings=0):
    self.min = min
    assert min > 0
    self.max = max
    assert max > min
    self.endorsements = endorsements
    self.earnings = 0
    self.proposal = proposal

  # @property
  # def needed(self):
  #   return self.min - self.earnings

  def __repr__(self):
    return "Entry(%r, earnings=%s, endorsements=%s, min=%s, max=%s)" % (self.proposal, self.earnings, self.endorsements, self.min, self.max)

class Contributor(object):
  def __init__(self, id, contribution, endorsements):
    self.id = id
    self.orginalContribution = contribution
    self.contribution = contribution
    self.endorsements = endorsements

###################################
#  for each contributor, allocate their funds to their choice that got most endorsements globally
#
###################################

def runContest(entries, contributors):
  """
  for each contributor, allocate their funds to their choice that got most endorsements globally
  """
  for c in contributors:
    while c.contribution:
      winner = None
      #find the project with the most endorsement that hasn't hit its max already
      for e in c.endorsements:
        if e.earnings >= e.max:
          continue
        if not winner or e.endorsements > winner.endorsements:
          winner = e
      if winner:
        if winner.earnings + c.contribution > winner.max:
          #don't give more than max
          contribution = winner.max - winner.earnings
          winner.earnings += contribution
          assert winner.earnings == winner.max
          c.contribution -= contribution
          assert c.contribution > 0
        else: 
          winner.earnings += c.contribution
          c.contribution = 0
      else:
        break
  return enforceMin(entries)

def generateEntries(min, max, endorsements, count):
  return [Entry(str(i), random.randrange(*min), random.randrange(*max), 
      endorsements and random.randrange(*endorsements) or 0) for i in range(count)]

def testContest():
  entryparams = [[4,30], [40,200], 0, 100]
  entries = generateEntries(*entryparams)
  
  contributorCount = 1000
  contributorDonation = [1,4]
  contributorEndorsementRange = [1, 10]
  contributors = [Contributor(str(i), random.randrange(*contributorDonation),
   random.sample(entries, random.randrange(*contributorEndorsementRange) )
   ) for i in range(contributorCount)]
  #tally endorsements
  for c in contributors:
    for e in c.endorsements:
      e.endorsements += 1

  pot = sum(c.contribution for c in contributors)
  entries.sort(key=operator.attrgetter('endorsements'), reverse=True)
  print 'pot', pot
  print 'parameters', entryparams  
  print entries

  firstroundLosers, leftoverPot = runContest(entries, contributors)
  print "contest results"
  print 'winners', len(entries)-len(firstroundLosers), 'losers', len(firstroundLosers), 'leftover', leftoverPot
  print sorted(entries, key=operator.attrgetter('earnings'), reverse=True)
  
  #missed = [c for c in contributors if not sum(e.earnings for e in c.endorsements)]
  #print 'contributors with no winners', len(missed)
  #for c in missed:
  #  print c.id, len(c.endorsements), c.endorsements
  missed = 0
  for c in contributors:
    winnerCount = len([e for e in c.endorsements if e.earnings])
    percent = round(winnerCount/(len(c.endorsements)*1.0),2)
    print c.id, ('*' if not percent else ''), percent, winnerCount, '/', len(c.endorsements)
    if not percent: 
      missed += 1
  print 'missed:', missed


###################################
# lottery style
#
# Goals:
# * Maximize each users endorsements win. As a proxy for that, maximize the number of 
# entries win by reducing the chance of an entry can win more than the minimum and giving 
# smaller minimums a better chance.
#
###################################
def runLottery(entries, pot):  
  return secondRound(*firstRound(entries, pot))

def firstRound(entries, pot, reduction=0.50, increment = 1):
  '''
  return True if there are losers
  '''
  assert pot > increment and pot % increment == 0
  #round 1: randomly assign each increment (e.g. each dollar) based on weight of endorsements
  chances = [[entry, entry.endorsements] for entry in entries]
  for i in range(0, pot, increment):
    index = windex(chances)
    winner = chances[index][0]
    winner.earnings += increment
    if winner.earnings >= winner.max:
      chances[index][1] = 0 #can't win anymore
      if not sum(x[1] for x in chances):
        #all won maximum!
        return [], pot - (i+increment)
    elif winner.earnings >= winner.min:
      chances[index][1] *= reduction #reduce changes of winning

  return enforceMin(entries)

def secondRound(losers, pot):
  #2nd round: allocate remaining pot, giving losers with the smallest needs another chance
  losers.sort(key=operator.attrgetter('min'))
  wtotal = sum([entry.endorsements for entry in losers])
  for entry in losers:
    if entry.min > pot:
      break
    n = random.uniform(0, wtotal)
    if n < entry.endorsements: #won!
      entry.earnings = entry.min
      pot -= entry.min
  return pot

def enforceMin(entries):
  returnToPot = 0
  losers = []
  for entry in entries:
    if entry.earnings < entry.min: #clear earnings from losers
      returnToPot += entry.earnings
      entry.earnings = 0
      losers.append(entry)
  return losers, returnToPot

#http://code.activestate.com/recipes/117241/
def windex(seq):
    '''
    an attempt to make a random.choose() function that makes weighted choices
    accepts a list of tuples with the item and probability as a pair
    like: 
    >>> x = [('one', 0.25), ('two', 0.25), ('three', 0.5)]
    >>> y=windex(x)'''
    lst = list(seq)
    if not lst:
        raise ValueError('list cant be empty')
    if any(x[1] < 0 for x in lst):
        raise ValueError("negative values not allowed")        
    wtotal = sum(x[1] for x in lst)
    if wtotal == 0:
        raise ValueError("no choice have a chance")
    n = random.uniform(0, wtotal)
    for index, (item, weight) in enumerate(lst):
        if n < weight:
            break
        n -= weight
    return index

from nose.tools import *
def testWindex():
    with assert_raises(ValueError):
        windex([])
    with assert_raises(ValueError):
        windex([('one', 0.25), ('two', 0.25), ('three', -0.5)])
    with assert_raises(ValueError):
        windex([('one', 0), ('two', 0), ('three', 0)])
    choice = windex([('one', 0.25), ('two', 0), ('three', 0.5)])
    assert choice in (0, 2)

def testLottery():
  pot = 40
  reduction = 0.99
  entryparams = [[1,10], [20,100], [1,100], 20]
  entries = generateEntries(*entryparams)
  entries.sort(key=operator.attrgetter('endorsements'), reverse=True)
  print 'pot', pot, 'chance reduction rate', reduction
  print 'parameters', entryparams  
  print entries
  
  #runLottery():
  firstroundLosers, secondRoundPot = firstRound(entries, pot, reduction)
  print "first round results"
  print len(entries)-len(firstroundLosers), len(firstroundLosers), sorted(entries, key=operator.attrgetter('earnings'), reverse=True)
  if firstroundLosers:
    firstRoundWinnings = sum([entry.earnings for entry in entries])
    print 'running second round, pot:', secondRoundPot, 'dispersed:', firstRoundWinnings
    assert secondRoundPot + firstRoundWinnings == pot
    print 'first round losers'
    print len(firstroundLosers), firstroundLosers
    leftoverPot = secondRound(firstroundLosers, secondRoundPot)

    print 'ran contest, remaining pot:', leftoverPot
    winnings = sum([entry.earnings for entry in entries])
    print 'total winnings', winnings
    winners, losers = [], []
    for entry in entries:
      if entry.earnings:
        winners.append(entry)
      else:
        losers.append(entry)

    print 'winners'
    print len(winners), sorted(winners, key=operator.attrgetter('earnings'), reverse=True)
    print 'losers'
    print len(losers), losers
    assert winnings + leftoverPot == pot
  else:
    print "everyone wins!"
    assert sum([entry.earnings for entry in entries]) == pot
  
if __name__ == '__main__':
  testWindex()
  #testLottery()
  testContest()