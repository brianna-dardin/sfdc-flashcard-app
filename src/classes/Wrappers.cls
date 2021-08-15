public without sharing class Wrappers {
    public class Level {
        @AuraEnabled
        public String level {get;set;}
        @AuraEnabled
        public Integer amount {get;set;}

        public Level(String level, Integer amount) {
            this.level = level;
            this.amount = amount;
        }
    }

    public class CardLevel {
        @AuraEnabled
        public Integer level {get;set;}
        @AuraEnabled
        public String completedDate {get;set;}

        public CardLevel(String newLevel, Date compDate) {
            this.level = Integer.valueOf(newLevel);

            Datetime compDateTime = Datetime.newInstance(compDate.year(), compDate.month(), compDate.day());
            this.completedDate = compDateTime.format('M/d/y');
        }
    }
    
    public class Session {
        @AuraEnabled
        public String sessId {get;set;}
        @AuraEnabled
        public String sessLink {get;set;}
        @AuraEnabled
        public String name {get;set;}
        @AuraEnabled
        public String deckFront {get;set;}
        @AuraEnabled
        public String levels {get;set;}
        @AuraEnabled
        public Integer numDrawn {get;set;}
        @AuraEnabled
        public Date completedDate {get;set;}
        @AuraEnabled
        public Integer totalCards {get;set;}
        @AuraEnabled
        public Integer correctCards {get;set;}
        @AuraEnabled
        public Integer incorrectCards {get;set;}
        @AuraEnabled
        public List<Flashcard> flashcards {get;set;}

        public Session(Session__c sess, List<Flashcard> flashcards) {
            this.sessId = sess.Id;
            this.sessLink = '/' + sess.Id;
            this.name = sess.Name;
            this.deckFront = sess.Deck_Front__c;
            this.numDrawn = Integer.valueOf(sess.Number_of_Cards_Drawn__c);
            this.flashcards = flashcards;

            if (String.isNotBlank(sess.Levels__c)) {
                this.levels = String.join(sess.Levels__c.split(';'), ', ');
            }

            if (sess.Completed_Date__c != null && sess.Total_Number_of_Cards__c > 0) {
                this.completedDate = sess.Completed_Date__c;
                this.totalCards = Integer.valueOf(sess.Total_Number_of_Cards__c);
                this.correctCards = Integer.valueOf(sess.Total_Number_Correct__c);
                this.incorrectCards = Integer.valueOf(sess.Total_Number_Incorrect__c);
            } else {
                this.completedDate = null;
                this.totalCards = 0;
                this.correctCards = 0;
                this.incorrectCards = 0;
            }
        }
    }

    public class Flashcard {
        @AuraEnabled
        public String cardId {get;set;}
        @AuraEnabled
        public String deckFront {get;set;}
        @AuraEnabled
        public Integer numIncorrect {get;set;}
        @AuraEnabled
        public String levelChange {get;set;}
        @AuraEnabled
        public Term term {get;set;}

        public Flashcard(Flashcard__c card, String deckFront) {
            this.cardId = card.Id;
            this.deckFront = deckFront;
            this.term = new Term(card.Chinese_Term__r);

            if (card.Number_of_Times_Incorrect__c != null && card.Number_of_Times_Incorrect__c > 0) {
                this.numIncorrect = Integer.valueOf(card.Number_of_Times_Incorrect__c);
            } else {
                this.numIncorrect = 0;
            }

            if (String.isNotBlank(card.Original_Level__c) && String.isNotBlank(card.New_Level__c)) {
                this.levelChange = card.Original_Level__c + ' → ' + card.New_Level__c;
            }
        }
    }

    public class Term {
        @AuraEnabled
        public String termId {get;set;}
        @AuraEnabled
        public String termLink {get;set;}
        @AuraEnabled
        public String name {get;set;}
        @AuraEnabled
        public String character {get;set;}
        @AuraEnabled
        public String pinYin {get;set;}
        @AuraEnabled
        public String english {get;set;}
        @AuraEnabled
        public String sound {get;set;}
        @AuraEnabled
        public String level {get;set;}
        @AuraEnabled
        public String prevLevel {get;set;}
        @AuraEnabled
        public Date createdDate {get;set;}
        @AuraEnabled
        public Date firstSessionDate {get;set;}
        @AuraEnabled
        public Date lastSessionDate {get;set;}
        @AuraEnabled
        public Integer numSessions {get;set;}
        @AuraEnabled
        public Integer numCorrect {get;set;}
        @AuraEnabled
        public Integer numIncorrect {get;set;}
        @AuraEnabled
        public Decimal pctCorrect {get;set;}
        @AuraEnabled
        public Decimal pctIncorrect {get;set;}
        @AuraEnabled
        public Boolean isActive {get;set;}

        public Term(Chinese_Term__c term) {
            this.termId = term.Id;
            this.termLink = '/' + term.Id;
            this.name = term.Name;
            this.character = term.Character__c;
            this.pinYin = term.Pin_Yin__c;
            this.english = term.English__c;
            this.sound = term.Sound_Link__c;
            this.level = term.Level__c;
            this.prevLevel = term.Previous_Level__c;
            this.isActive = term.Is_Active__c;

            Datetime dt = term.CreatedDate;
            this.createdDate = Date.newInstance(dt.year(), dt.month(), dt.day());

            if (term.Total_Number_of_Sessions__c > 0) {
                this.firstSessionDate = term.First_Session_Date__c;
                this.lastSessionDate = term.Last_Session_Date__c;
                this.numSessions = Integer.valueOf(term.Total_Number_of_Sessions__c);
                this.numCorrect = Integer.valueOf(term.Total_Number_Correct__c);
                this.numIncorrect = Integer.valueOf(term.Total_Number_Incorrect__c);
                this.pctCorrect = term.Percent_Correct__c / 100;
                this.pctIncorrect = term.Percent_Incorrect__c / 100;
            } else {
                this.firstSessionDate = null;
                this.lastSessionDate = null;
                this.numSessions = 0;
                this.numCorrect = 0;
                this.numIncorrect = 0;
                this.pctCorrect = 0;
                this.pctIncorrect = 0;
            }
        }
    }
}