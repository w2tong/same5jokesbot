import audio from '../util/audioFileMap';
import { getMomentTorontoCurrentTime, getRandomRange } from '../util/util';

const congratulations = [audio.congratulations01, audio.congratulations02, audio.congratulations03, audio.congratulations04, audio.congratulations05, audio.congratulations06, audio.congratulations07, audio.congratulations08, audio.congratulations09, audio.congratulations10, audio.congratulations11, audio.congratulations12, audio.congratulations13];
function getCongratulations(): string {
    return congratulations[getRandomRange(congratulations.length)];
}

const shutUp = [audio.smoshShutUp, audio.imaqtpieShutUp];
function getShutUp(): string {
    return shutUp[getRandomRange(shutUp.length)];
}

const letsGo = [audio.ryzeLetsGo, audio.dababyLetsGo];
function getLetsGo(): string {
    return letsGo[getRandomRange(letsGo.length)];
}

const valor = [audio.quinnToMe, audio.quinnWhatDoYouSeeUpThere];
function getValor(): string {
    return valor[getRandomRange(valor.length)];
}

const dog = [audio.whatTheDogDoin, audio.iAmADoggie];
function getDog(): string {
    return dog[getRandomRange(dog.length)];
}

const mask = [audio.baneMask, audio.dreamMask];
function getMask(): string {
    return mask[getRandomRange(mask.length)];
}

const noNoNo = [
    audio.noNoNoNotLikeThat, 
    // audio.jerryNoNoNo
];
function getNoNoNo(): string {
    return noNoNo[getRandomRange(noNoNo.length)];
}

const blind = [audio.imBlindNotDeaf, audio.smellyEnemy];
function getBlind(): string {
    return blind[getRandomRange(blind.length)];
}

const ohSh_t = [audio.ohShtARat, audio.ohShtAGhost];
function getOhSh_t(): string {
    return ohSh_t[getRandomRange(ohSh_t.length)];
}

const hello = [audio.d4nnyHello1, audio.d4nnyHello2];
function getHello(): string {
    return hello[getRandomRange(hello.length)];
}

const negativeCreep = [audio.negativeCreep_crude, audio.negativeCreep_drone1, audio.negativeCreep_drone2, audio.negativeCreep_stoned1, audio.negativeCreep_stoned2];
function getNegativeCreep(): string {
    return negativeCreep[getRandomRange(negativeCreep.length)];
}

const constableJones = [audio.cjAFriendInNeedIsAFriendIndeed, audio.cjALeopardCantChangeItsSpots,audio.cjALittleKnowledgeIsADangerousThing, audio.cjAPennySavedIsAPennyEarned, audio.cjAProblemSharedIsAProblemHavled, audio.cjAccidentsWillHappen, audio.cjActionsSpeakLouderThanWords, audio.cjAllsWellThatEndsWell, audio.cjAppearancesCanBeDeceiving, audio.cjBetterSafeThanSorry, audio.cjBetterToHaveLovedAndLost, audio.cjBetweenARockAndAHardPlace, audio.cjCatsGotYourTongue, audio.cjCatsOutOfTheBag, audio.cjCleaninessIsNextToGodliness, audio.cjCuriosityKilledTheCat, audio.cjDamnedIfYouDoDamnedIfYouDont, audio.cjDifferentStrokes, audio.cjDontCountYourChickens, audio.cjDontJudgeABookByItsCover, audio.cjDontShootTheMessenger, audio.cjEarlyBird, audio.cjEveryCloudHasASilverLining, audio.cjGoodFencesMakeGoodNeighbors, audio.cjGrassIsAlwaysGreener, audio.cjHasteMakesWaste, audio.cjHonestyIsTheBestPolicy, audio.cjIfItAintBrokeDontFixIt, audio.cjInnocentUntilProvenGuilty, audio.cjJealousyIsAGreeneyedMonster, audio.cjKeepCalmAndCarryOn, audio.cjKnowledgeIsPower, audio.cjLetSleepingDogsLie, audio.cjLifesNotFair, audio.cjOldHabitsDieHard, audio.cjPowerCorrupts, audio.cjSharingIsCaring, audio.cjSilenceIsGolden, audio.cjSomePeopleHaveAllTheLuck, audio.cjSomeThingsAreBetterLeftUnsaid, audio.cjSpeakOfTheDevil, audio.cjStrangerThingsHaveHappened, audio.cjTheCityCanBeACruelMistress, audio.cjTheDevilIsInTheDetails, audio.cjTheProofOfThePudding, audio.cjTheRoadToHell, audio.cjTheTongueIsATwoEdgedSword, audio.cjTheTruthShallSetYouFree, audio.cjTheTruthWillOut, audio.cjTimeHealsAllWounds, audio.cjTwoHeadsAreBetterThanOne, audio.cjTwoWrongsDontMakeARight, audio.cjWhenInDoubt, audio.cjWhenItRainsItPours, audio.cjWhenOneDoorCloses, audio.cjWhereTheresAWill, audio.cjWhereTheresSmokeTheresFire, audio.cjYouAlwaysWantWhatYouCantHave, audio.cjYouCanLeadAHorseToWater, audio.cjYouCantMakeAnOmelette, audio.cjYouCatchMoreFliesWithHoneyThanVinegar];
function getConstableJones(): string {
    return constableJones[getRandomRange(constableJones.length)];
}

const regexToAudio = [
    {
        regex: /w(oah|hoa)/,
        getAudio: () => audio.basementGang
    },
    {
        regex: /(thunder v(ersu)?s lightning)/,
        getAudio: () => audio.thunderVsLightningFull
    },
    {
        regex: /demon time/,
        getAudio: () => audio.demonTime
    },
    {
        regex: /i'?m.*(4|four|poor|bored)/,
        getAudio: () => audio.imFour
    },
    {
        regex: /sigh|yuno/,
        getAudio: () => audio.sykkunoHere
    },
    {
        regex: /uh.*oh/,
        getAudio: () => audio.uhOhStinky
    },
    {
        regex: /(tbc.*hype|focus.*up)/,
        getAudio: () => audio.tbcHype
    },
    {
        regex: /suction/,
        getAudio: () => audio.suction
    },
    {
        regex: /time (to|2) stop/,
        getAudio: () => audio.itsTimeToStop
    },
    {
        regex: /what the dog doing/,
        getAudio: () => audio.whatTheDogDoin
    },
    {
        regex: /i am a dog/,
        getAudio: () => audio.iAmADoggie
    },
    {
        regex: /bean|badlands|chugs|eric booker/,
        getAudio: () => audio.badlandsChugsBeans
    },
    {
        regex: /smosh|shut.*up|imaqtpie/,
        getAudio: () => getShutUp()
    },
    {
        regex: /i don'?t think so/,
        getAudio: () => audio.noIDontThinkSo
    },
    {
        regex: /fulcrum|come in/,
        getAudio: () => audio.fulcrumComeIn
    },
    {
        regex: /obliterated|need i say more/,
        getAudio: () => audio.fulcrumObliterated
    },
    {
        regex: /good morning,? donda/,
        getAudio: () => audio.goodMorningDonda
    },
    {
        regex: /good morning|morning|\bgm\b|donda/,
        getAudio: () => audio.goodMorningDondaShort
    },
    {
        regex: /(not|doesn'?t) look.*good|but watch this/,
        getAudio: () => audio.gugaSousVide
    },
    {
        regex: /wake.*up/,
        getAudio: () => audio.chopSueyWakeUp
    },
    {
        regex: /you wanted to/,
        getAudio: () => audio.chopSueyYouWantedTo
    },
    {
        regex: /forget|forgot|forgor|(i'?m|i am) walking here|don'?t you/,
        getAudio: () => audio.furgetAboutIt
    },
    {
        regex: /i'?m blind|can'?t see/,
        getAudio: () => getBlind()
    },
    {
        regex: /they came|from behind/,
        getAudio: () => audio.theyCameFromBehind
    },
    {
        regex: /no,?\s*no,?\s*no|not like that/,
        getAudio: () => getNoNoNo()
    },
    {
        regex: /soda/,
        getAudio: () => audio.bidenSoda
    },
    {
        regex: /legend(ary)?/,
        getAudio: () => audio.hsGoldenLegendary
    },
    {
        regex: /grats|congratulations|\bgz\b/,
        getAudio: () => getCongratulations()
    },
    {
        regex: /([0-9]+|one|two|three|four|five|six|seven|eight|nine|for)\s*(pc|piece|set|peace)/,
        getAudio: () => audio.theOnePieceIsReal
    },
    {
        regex: /hbd|b(irth)?day/,
        getAudio: () => audio.micahelItsYourBirthdayToday
    },
    {
        regex: /ahem|cough|breakfast/,
        getAudio: () => audio.breakfast
    },
    {
        regex: /food/,
        getAudio: () => {
            const hour = getMomentTorontoCurrentTime().hour();
            if (hour >= 4 && hour < 12) {
                return audio.breakfast;
            }
            return '';
        }
    },
    {
        regex: /infinite|possib|\baxe\b/,
        getAudio: () => audio.infinitePossibilities
    },
    {
        regex: /small.*cat|feral|meow/,
        getAudio: () => audio.imaqtpieSmallCat
    },
    {
        regex: /under.*water/,
        getAudio: () => audio.iAmUnderTheWater
    },
    {
        regex: /arthur|knit|fuchsia/,
        getAudio: () => audio.arthurKnitter
    },
    {
        regex: /zoomin|foreign|\bt(yler)?\s?(1|one)/,
        getAudio: () => audio.zoominInTheForeign
    },
    {
        regex: /(bye|baj|badge) (bye|baj|badge)/,
        getAudio: () => audio.bajBaj
    },
    {
        regex: /dream|smp|that's what the mask is/,
        getAudio: () => audio.dreamMask
    },
    {
        regex: /bane|no one cared|put on the mask/,
        getAudio: () => audio.baneMask
    },
    {
        regex: /(for|4)\s+(yo)?u/,
        getAudio: () => audio.baneForYou
    },
    {
        regex: /get ready/,
        getAudio: () => audio.bloonsGetReadyMOAB
    },
    {
        regex: /disgusting/,
        getAudio: () => audio.disgustang
    },
    {
        regex: /\ball the\b|alda/,
        getAudio: () => audio.smallThings
    },
    {
        regex: /small things/,
        getAudio: () => audio.allThe
    },
    {
        regex: /(o|u)h.*guys/,
        getAudio: () => audio.bloonsUhGuys
    },
    {
        regex: /teleporting fat guy/,
        getAudio: () => audio.teleportingFatGuy
    },
    {
        regex: /teleport|fat guy/,
        getAudio: () => audio.teleportingFatGuyShort
    },
    {
        regex: /developers developers developers/,
        getAudio: () => audio.steveBallmerDevelopers
    },
    {
        regex: /valor/,
        getAudio: () => getValor()
    },
    {
        regex: /let'?s go/,
        getAudio: () => getLetsGo()
    },
    {
        regex: /obamn?a/,
        getAudio: () => audio.obamna
    },
    {
        regex: /((ya|yeah),?\s*){3}/,
        getAudio: () => audio.iAmLorde
    },
    {
        regex: /oh?,?\s*((g|j)eez|cheese)/,
        getAudio: () => audio.ohGeez
    },
    {
        regex: /wrapped around your finger/,
        getAudio: () => audio.wrappedAroundYourFinger
    },
    {
        regex: /manwa|manua|manhua|manga|anime|v.*tuber|get a life|gura|amelia watson|iron mouse/,
        getAudio: () => audio.docGetALife
    },
    {
        regex: /game over/,
        getAudio: () => audio.bloonsGameOverMan
    },
    {
        regex: /jinx/,
        getAudio: () => audio.jinx
    },
    {
        regex: /library|be (quiet|silent)/,
        getAudio: () => audio.thisIsLibrary
    },
    {
        regex: /i was hiding/,
        getAudio: () => audio.twitchIWasHiding
    },
    {
        regex: /short joke/,
        getAudio: () => audio.veigarShortJoke
    },
    {
        regex: /silence/,
        getAudio: () => audio.dota2Silence
    },
    {
        regex: /let (him|me) cook/,
        getAudio: () => audio.letHimCook
    },
    {
        regex: /i('?m| am) a dwarf|diggy diggy hole/,
        getAudio: () => audio.diggyDiggyHole
    },
    {
        regex: /i gotta go|i'?m leaving|since we'?re not doing anything/,
        getAudio: () => audio.discordDisconnect
    },
    {
        regex: /oink|pig/,
        getAudio: () => audio.fatLikeAPig
    },
    {
        regex: /that'?s it|i'?m dead/,
        getAudio: () => audio.wc3PeasantThatsItImDead
    },
    {
        regex: /why (nu|new)\s*(nu|new)/,
        getAudio: () => audio.imRippingOutMyHair
    },
    {
        regex: /ripping out my hair/,
        getAudio: () => audio.whyNunuWhy
    },
    {
        regex: /sneez|bless you|hocus pocus/,
        getAudio: () => audio.trainSneeze
    },
    {
        regex: /slow mo(de)?|slow.*(it|that|sneeze).*down/,
        getAudio: () => audio.trainSneezeSlow
    },
    {
        regex: /(for|four|force?)\s*(send?|sin|and|in|son|cen|ing)/,
        getAudio: () => audio.boys
    },
    {
        regex: /whopper,? whopper,? whopper,? whopper/,
        getAudio: () => audio.whopperWhopper
    },
    {
        regex: /whopper/,
        getAudio: () => audio.whopperWhopperShort
    },
    {
        regex: /keep it hard.*core/,
        getAudio: () => audio.keepItHardcore
    },
    {
        regex: /to the arena/,
        getAudio: () => audio.xinZhaoToTheArena
    },
    {
        regex: /f(ri|u)cked/,
        getAudio: () => audio.whatAFdUpDay
    },
    {
        regex: /i did not|it'?s not true|it'?s bullshit|hi,? mark/,
        getAudio: () => audio.ohHiMark
    },
    {
        regex: /where (are they|is she)/,
        getAudio: () => audio.batmanWhereAreThey
    },
    {
        regex: /(j|g)erry/,
        getAudio: () => audio.jerry
    },
    {
        regex: /wedg(ie|y)|wechi/,
        getAudio: () => audio.wedgieMommy
    },
    {
        regex: /killer/,
        getAudio: () => audio.killerKS
    },
    {
        regex: /potion seller/,
        getAudio: () => audio.potionSeller
    },
    {
        regex: /dopa|don't put down/,
        getAudio: () => audio.dopaDown
    },
    {
        regex: /\ba tip\b/,
        getAudio: () => audio.xinZhaoAndASpearBehindIt
    },
    {
        regex: /disconnect|\bdc\b/,
        getAudio: () => audio.heDisconnected
    },
    {
        regex: /\baudi\b/,
        getAudio: () => audio.audi
    },
    {
        regex: /what.*is this game about/,
        getAudio: () => audio.docWhatIsThisGameAbout
    },
    {
        regex: /chinese motorcycle/,
        getAudio: () => audio.docChineseMotorcycle
    },
    {
        regex: /oh sh.t a rat/,
        getAudio: () => audio.ohShtARat
    },
    {
        regex: /oh sh.t a ghost/,
        getAudio: () => audio.ohShtAGhost
    },
    {
        regex: /oh sh.t a/,
        getAudio: () => getOhSh_t()
    },
    {
        regex: /(yo)?u should/,
        getAudio: () => audio.ltgNow
    },
    {
        regex: /nice job/,
        getAudio: () => audio.niceJobTeam
    },
    {
        regex: /waiting for.*bus/,
        getAudio: () => audio.noDuhImAtTheBusStopToo
    },
    {
        regex: /\bbus\b/,
        getAudio: () => audio.waitingForTheBusToo
    },
    {
        regex: /enough talk/,
        getAudio: () => audio.badlandsChugsEnoughTalk
    },
    {
        regex: /that'?s pretty true/,
        getAudio: () => audio.trainTrue
    },
    {
        regex: /(bing|being|thing|been) chilling/,
        getAudio: () => audio.bingChilling
    },
    {
        regex: /clean cut/,
        getAudio: () => audio.bloonsCleanCut
    },
    {
        regex: /faded (then|than|in) a ho/,
        getAudio: () => audio.fulcrumFadedThanAHo
    },
    {
        regex: /go go go/,
        getAudio: () => audio.strangerThingsGoGoGo
    },
    {
        regex: /max and i are in danger/,
        getAudio: () => audio.strangerThingsMaxAndIAreInDanger
    },
    {
        regex: /do you hear me/,
        getAudio: () => audio.strangerThingsTheDemigorgonsAreComing
    },
    {
        regex: /(demi|emmy|tammy|me|giga|kiki) ((c|g|t)or(gg?|k|p)(a|e|i|o)n)s? are coming/,
        getAudio: () => audio.strangerThingsDoYouHearMe
    },
    {
        regex: /giga/,
        getAudio: () => audio.gigaChad
    },
    {
        regex: /leave me alone/,
        getAudio: () => audio.leaveMeAloneDing
    },
    {
        regex: /akira/,
        getAudio: () => audio.akiraDing
    },
    {
        regex: /ladies and gentlemen/,
        getAudio: () => audio.myNameIsAndyRightHere
    },
    {
        regex: /don'?t worry about it/,
        getAudio: () => audio.itsOnMe
    },
    {
        regex: /it'?s on me/,
        getAudio: () => audio.dontWorryAboutIt
    },
    {
        regex: /rox[ai]s/,
        getAudio: () => audio.khWhatdYouDoWithKairi
    },
    {
        regex: /what('d| did| do)? you do with (kairi|kyrie)/,
        getAudio: () => audio.khShesApartOfTheDarknessNow
    },
    {
        regex: /she doesn'?t need the light/,
        getAudio: () => audio.khYoureANobody1
    },
    {
        regex: /where( are)? your friends now/,
        getAudio: () => audio.khIDontNeedAnyFriends
    },
    {
        regex: /i'?m (a ?)?part of the darkness/,
        getAudio: () => audio.khYoureANobody2
    },
    {
        regex: /you'?re over sora/,
        getAudio: () => audio.khNo
    },
    {
        regex: /don'?t hit the camera man|picks up sword|(dual|duo) (wield|wheel)/,
        getAudio: () => audio.khDualWield
    },
    {
        regex: /i can'?t kill you,? you'?re a part of me/,
        getAudio: () => audio.khYoureAFoolSora
    },
    {
        regex: /i can'?t kill you/,
        getAudio: () => audio.khICantKillYou
    },
    {
        regex: /((you know what|it'?s like|as) )?they ((also|always) )?(say|said)$/,
        getAudio: () => getConstableJones()
    },
    {
        regex: /that'?s crazy/,
        getAudio: () => audio.ciSin
    },
    {
        regex: /chris/,
        getAudio: () => audio.pomNowThatHesBald
    },
    {
        regex: /gurney/,
        getAudio: () => audio.destinyIWouldNever
    },
    {
        regex: /hello to (the people|everybody)|i must say hello/,
        getAudio: () => getHello()
    },
    {
        regex: /would you rather/,
        getAudio: () => audio.treeGrow
    },
    {
        regex: /everybody|cheers|take care|amazing|that'?s what i'?m talking about|all right/,
        getAudio: () => audio.gugaEverybody
    },
    {
        regex: /i'?m a negative creep and i'?m/,
        getAudio: () => getNegativeCreep()
    },
];

export default (command: string) => {
    for (const regexAudio of regexToAudio) {
        if (regexAudio.regex.test(command)) {
            return regexAudio.getAudio();
        }
    }
    return '';
};