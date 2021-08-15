public without sharing class CaptchaController {
    private static String secretKey = '';

    @AuraEnabled
    public static Boolean verifyCaptcha(String token) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://www.google.com/recaptcha/api/siteverify');
        request.setMethod('POST');
        request.setBody('secret=' + secretKey + '&response=' + token);
        HttpResponse response = http.send(request);
        
        Boolean valid = false;
        if (response.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            valid = Boolean.valueOf(responseMap.get('success'));
        }

        return valid;
    }
}