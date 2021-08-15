## Chinese Flashcards for Salesforce

You might be thinking, why would anyone create a flashcard app on Salesforce of all platforms? And you'd be right. I started studying Chinese several months ago, and while there are plenty of robust flashcard apps out there, I decided I wanted to make one of my own to suit my own tastes. Particularly, so I can have more visibility in vocab progression and performance. As a full-time Salesforce Developer, it was simply natural to me to use Salesforce to implement my vision!

This flashcard app is based on the Spaced Repetition concept for learning new words (or anything else!) in which each word reviewed gets put into buckets, and every time you successfully remember a word, it gets moved into a higher bucket, so you are shown the word less and less frequently over time, until eventually you've "mastered" the word and no longer see it! 

In this app, these buckets are called levels, and go from 1 (new vocab) to 8 (mastered/retired). Each flashcard session pulls a number of level 1 cards that you specify, and all of the cards of that day's level. This app employs a simple implementation of the concept (other apps, such as Anki, have much more complicated algorithms) as laid out in Nicky Case's explanation of the concept found [here](https://ncase.me/remember/).

I built a Customer Community only as a public facing demonstration of how the app operates; this is definitely not a serious product. It is designed for use only as a guest user, where you have access to a limited amount of example data, but you can create your own vocab terms and play flashcards with this data. You can find the live community [here](https://brianna-dardin-developer-edition.na129.force.com/flashcards/s/). I implemented the [reCaptcha API](https://www.google.com/recaptcha/about/) on the community to protect it from spam. I've also implemented [ChartJS](https://www.chartjs.org/) to display some charts visible both in the community and internally.

Are you interested in deploying the app in your own Salesforce environment? Follow the steps below!

### Pre-Deployment Steps

1. Download this repository either as a zip file or as a local clone.
* Enable Digital Experiences and choose a subdomain
* Go to Setup -> Digital Experiences -> Settings and check "Enable ExperienceBundle Metadata API" and check "Let customer users access notes and attachments"
* Go to the [reCaptcha Admin Console](https://www.google.com/recaptcha/admin/create) to set up the reCaptcha for the community domain 
* Use the full domain from step 2 (should end with "force.com" unless you're using a custom domain)
* Select reCaptcha Type -> reCaptcha v2 -> Invisible reCaptcha Badge
* Open src\experiences\Chinese_Flashcards1\config\mainAppPage.json and look at the ```headMarkup``` tag. Search for ```sitekey``` and put in the site key
* Open src\classes\CaptchaController.cls and put in the secret key where it says ```private static String secretKey =```

### Deployment Steps

1. Convert the src folder into a zip file. The zip file should include all of the contents of the folder, not the folder itself.
2. Use [Ant Migration Tool](https://developer.salesforce.com/docs/atlas.en-us.daas.meta/daas/forcemigrationtool_install.htm) or [Workbench](https://workbench.developerforce.com/login.php) to deploy the zip file.

### Post-Deployment Steps

1. It is not (currently) possible to deploy the community and the guest user profile at the same time, so I created a permission set to assign to the guest user. If you don't know how to reach the guest user, go to Setup -> Digital Experiences -> Builder for the "Chinese Flashcards" community -> Settings -> General -> "Chinese Flashcards Profile" under "Guest User Profile" -> Assigned Users -> Click on the Site Guest User -> Permission Set Assignments -> Assign the "Chinese Flashcards Permissions Guest User" permission set

### Notes

1. When a community is created, Salesforce auto-generates some Visualforce and Apex files to serve as the default pages for certain things (such as error pages). I discovered during my attempt to deploy this project into a new org that these files do not exist prior to creating the community. Therefore, in order to make this app easily deployable in one zip file, I included the relevant Salesforce generated code in this repository. I am not claiming I wrote them myself. In src\package.xml I explicitly call out all the metadata I personally created, and everything not found in this file is covered by the wildcard *.
2. The community works fine on desktop and mobile landscape mode, but not so much on mobile portrait mode. At some point in the future I will work on fixing this.
3. You might notice that I included a CSP Trusted Site file for my favored Chinese dictionary, [Written Chinese](https://dictionary.writtenchinese.com/). While I created an LWC for creating vocab terms where audio files can be uploaded, for my own personal use it was much easier to simply grab the link to the sound file from this site and use it to populate the Sound_Link__c field on Chinese_Term__c. If you prefer another source for audio files, be sure to create a CSP Trusted Site record for that domain or the audio won't work when playing flashcards.
4. Thank you very much for your interest! If you have any questions or comments, please feel free to reach out to me at any time!