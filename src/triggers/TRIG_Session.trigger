trigger TRIG_Session on Session__c (before insert, after insert, before update, after update, before delete, after delete) {
    if (Trigger.isInsert) {
        if (Trigger.isAfter) {
            TRIG_SessionHandler.afterInsert(Trigger.new);
        }
    }
}