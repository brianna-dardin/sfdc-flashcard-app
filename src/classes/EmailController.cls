public without sharing class EmailController {
    @AuraEnabled
    public static void sendEmail(String firstName, String lastName, String formType, String fromEmail, String toEmails, String message) {
        String plainBody = 'A new ' + formType + ' email has been sent.\n\n';
        plainBody += 'First Name: ' + firstName + '\n';
        plainBody += 'Last Name: ' + lastName + '\n';
        plainBody += 'Email: ' + fromEmail;
        
        if (String.isNotBlank(message)) {
            plainBody += '\n\nMessage:\n' + message;
        }

        String[] toEmailArray = new String[]{};
        toEmailArray.addAll(toEmails.split(','));

        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setSubject('New ' + formType + ' Email');
        mail.setPlainTextBody(plainBody);
        mail.setToAddresses(toEmailArray);
        mail.setReplyTo(fromEmail);
        mail.saveAsActivity = false;
        
        try {
            Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}