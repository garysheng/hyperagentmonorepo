nstagram API with Instagram Login
The Instagram API with Instagram Login allows Instagram professionals — businesses and creators — to use your app to manage their presence on Instagram. The API can be used to:

Instagram Media Insights are now available for Instagram API with Instagram Login. Learn more.

Comment moderation – Manage and reply to comments on their media
Content publishing – Get and publish their media
Media Insights - Get insights on their media
Mentions – Identify media where they have been @mentioned by other Instagram users
Messaging – Send and receive messages with customers or people interested in their Instagram account
Note: This API setup does not require a Facebook Page to be linked to the Instagram professional account.

To ensure consistency between scope values and permission names, we are introducing new scope values for the Instagram API with Instagram login. The new scope values are:

instagram_business_basic
instagram_business_content_publish
instagram_business_manage_messages
instagram_business_manage_comments
These will replace the existing business_basic, business_content_publish, business_manage_comments and business_manage_messages scope values, respectively.

Please note that the old scope values will be deprecated on January 27, 2025. It is essential to update your code before this date to avoid any disruption in your app's functionality. Failure to do so will result in your app being unable to call the Instagram endpoints.

Limitations
This API setup cannot access ads or tagging.


Overview
The Instagram Platform is a collection of APIs that allows your app to access data for Instagram professional accounts including both businesses and creators. You can build an app that only serves your Instagram professional account, or you can build an app that servers other Instagram professional accounts that you do not own or manage.

There are two Instagram API configurations you can use in your app:

Instagram API with Facebook Login for Business	Instagram API with Business Login for Instagram
Your app serves Instagram professional accounts that are linked to a Facebook Page
Your app users use their Facebook credentials to log in to your app
Your app serves Instagram professional accounts with a presence on Instagram only
Your app users use their Instagram credentials to log in to your app
Depending on the configuration you choose, your app users will be able to have conversations with their customers or people interested in their Instagram professional account, moderate comments on their media, send private replies, publish content, publish ads, and get insights.

Which API is right for my app?
Component
Instagram API setup with Instagram Login	Instagram API setup with Facebook Login
Access token type	
Instagram User

Facebook User or Page

Authorization type	Business Login for Instagram	Facebook Login for Business
Comment moderation	
Content publishing	
Facebook Page	
x
Required
Hashtag search	
x
Insights	
Mentions	
Messaging	
via Messenger Platform
Product tagging	
x
Partnership Ads	
x
Access levels
There are two access levels available to your app: Standard Access and Advanced Access.

Standard Access

Standard Access is the default access level for all apps and limits the data your app can get. It is intended for apps that will only be used by people who have roles on them, during app development, or for testing your app. If your app only serves your Instagram professional account or an account you manage, Standard Access is all your app needs.

Advanced Access

Advanced Access is the access level required if your app serves Instagram professional accounts that you don't own or manage and can be used by app users who do not have a role on your app or a role on a business portfolio that has claimed your app. This access level requires App Review and Business Verification.

Note: Because of the limited scope of Standard Access, some features might not work properly until your app has been granted Advanced Access. This might limit the functionality of any test apps you use.

Learn more about Advanced and Standard Access.

App Review
Meta App Review enables Meta to verify that your app uses our products and APIs in an approved manner. Your app must complete Meta App Review to be granted Advanced Access. Learn more about Meta App Review.

Private apps
If reviewers are unable to test your app because it is behind a private intranet, has no user interface, or has not implemented Facebook Login for Business, you can request approval only for the following permissions:

instagram_basic
instagram_manage_comments
App users
To use the APIs, your app users must have an Instagram professional account. An Instagram professional account can be for a business or creator. You can build your app so that it serves businesses and creators with Instagram professional accounts that only have a presence on Instagram and use Business Login for Instagram, or businesses and creators with Instagram professional accounts that are linked to a Facebook Page and use Facebook Login for Business. For an Instagram professional account that is linked to a Facebook Page, your app user must also be able to perform admin-equivalent tasks on the linked Facebook Page.

Your app will also interact with Instagram users who interact with your app users' Instagram professional accounts. These interactions can happen through comments and reactions on your app users' Instagram comments, posts, reels, and stories, ads, and Instagram Direct.

Authentication and authorization
Endpoint authorization is handled through permissions and features. Before your app can use an endpoint to access an app user's Instagram professional account data, you must first request all permissions required by those endpoints from the app user. You can request permissions from app users by implementing Business Login for Instagram or Facebook Login for Business. If you implement Business Login for Instagram, your app users log in with their Instagram credentials. If you implement Facebook Login for Business your app users log in with their Facebook credentials.

To start the log in flow, an app user clicks your embed URL. Meta opens an authorization window where the user grants your app the requested permissions. Meta then redirects the user to your app’s redirect URI and sends your app an Authorization Code. This code is valid for one hour.

Next, exchange the authorization code for a short-lived access token, an ID for your app user, and a list of permissions granted by your app user. This access token is valid for one hour. Access tokens follow the OAuth 2.0 protocol, are app-scoped (unique to your app and app user), and required for most API calls. Apps using Business Login for Instagram receive Instagram User access tokens and apps using Facebook Login for Business receive Facebook User access tokens.

Before the short-lived access token expires, your app exchange it for a long-lived access token. This access token is valid for 60 days and can be refreshed before they expire.

Once permissions have been granted and your app receives an access token, your app can query the endpoints to access the user's data. Note that a permission only allows access to data created by the app user who granted the permission. There are a few endpoints that allow apps to access data not created by the app user, but the accessible data is limited and public.

If your app serves only your Instagram professional accounts, or accounts you manage, you do not need to implement a login flow. However, you will need to configure the business login settings in the App Dashboard to obtain an Instagram app ID and an Instagram app secret, as well as obtain long-lived access tokens to use in your API calls.


Features and permissions
The API uses the following permissions and features, which are based on login type:

Instagram login	Facebook login
instagram_business_basic
instagram_business_content_publish
instagram_business_manage_comments
instagram_business_manage_messages
Human Agent
instagram_basic
instagram_content_publish
instagram_manage_comments
instagram_manage_insights
instagram_manage_messages
pages_show_list
pages_read_engagement
Human Agent
Instagram Public Content Access

The Human Agent feature allows your app to have a human agent respond to user messages using the human_agent tag within 7 days of a user's message. The allowed usage for this feature is to provide human agent support in cases where a user’s issue cannot be resolved in the standard messaging window. Examples include when the business is closed for the weekend, or if the issue requires more than 24 hours to resolve.

The Instagram Public Content Access feature allows your app to access Instagram Graph API's Hashtag Search endpoints. The allowed usages for this feature is to discover content associated with your hashtag campaigns, understand public sentiment around your brand or identify contest, competition and sweepstakes entrants. It can also be used to provide customer support and better understand and manage your audience.

See our API Reference to determine which permission and features your app will need to request from app users.

Base URLs
For apps using Business Login for Instagram, where your app users log in with their Instagram credentials, all endpoints are accessed via the graph.instagram.com host.

For apps using Facebook Login for Business, where your app users' Instagram professional account is linked to a Facebook Page and your app users log in with their Facebook credentials, all endpoints are accessed via the graph.facebook.com host.

Business verification
You must complete Business Verification if your app requires Advanced Access; if your app will be used by app users who do not have a Role on the app itself, or a Role in a Business that has claimed the app.

Comment moderation
An Instagram user comments on your app user's Instagram professional account's media. Your app can use the API to get comments, reply to comments, delete comments, hide/unhide comments, and disable/enable comments on Instagram media owned by your app user's Instagram professional account. The API can also identify media where the Instagram professional account has been @mentioned by other Instagram users.

Content publishing
Your app can use the API to publish single images, videos, reels (single media posts), or posts containing multiple images and videos (carousel posts) on behalf of your app user's Instagram professional accounts.

Content Delivery Network URLs
Instagram Platform leverages Content Delivery Network (CDN) URLs which allow you to retrieve rich media content shared by Instagram users. The CDN URL is privacy-aware and will not return the media when the content has been deleted or has expired.

Collaborators
Facebook Login for Business only.

The Instagram Collaborator Tags allows Instagram users to co-author content, such as publish media with other accounts (collaborators).

With a few exceptions, data on or about co-authored media can only be accessed through the API by the user who published the media; collaborators are unable to access this data via the API. The only exceptions are when searching for top performing media or recently published media that has been tagged with a specific hashtag.

Develop with Meta
Before you can integrate a Meta Technologies API into your app, you must register as a Meta developer and then create an app in the Meta App Dashboard that represents your app.

When creating an app, you will add the following products depending on login type:

Business Login for Instagram	Facebook Login for Business
Products Required	
Instagram > Instagram API setup with Instagram login
Facebook Login for Business
Messenger, including Instagram settings for sending and receiving messages
Instagram > Instagram API setup with Facebook login
App IDs
App IDs are required during authentication and can be found in the app's Meta App Dashboard. Apps that use Facebook Login for Business will use the Meta app ID displayed at the top of the Meta App Dashboard for your app. Apps that use Business Login for Instagram will use the Instagram app ID displayed on the Instagram > API setup with Instagram login section of the dashboard.

Facebook Pages
If your app implements Facebook Login for Business, your app users' Instagram professional accounts must be connected to a Facebook Page.

Tasks

Your app users must be able to perform tasks on the Facebook Page linked to their Instagram professional account so that they can grant your app permissions related to those tasks. The following table maps the name of the task in our UIs, such as Facebook Page Settings or Meta Business Suite, with task names returned in GET /me/accounts endpoint requests, and the permission the user can grant if they can perform that task.

Task name in UIs	Task name in API	Grantable Permissions
Ads

PROFILE_PLUS_ADVERTISE

instagram_basic

Content

PROFILE_PLUS_CREATE_CONTENT

instagram_basic instagram_content_publish

Full control

PROFILE_PLUS_FULL_CONTROL

instagram_basic instagram_content_publish

Insights

PROFILE_PLUS_ANALYZE

instagram_basic instagram_manage_insights

Messages

PROFILE_PLUS_MESSAGING

instagram_basic
instagram_manage_messages

Community Activity

PROFILE_PLUS_MODERATE

instagram_basic
instagram_manage_comments

See our Instagram API Reference to see which permissions each endpoint requires.

Scoped User IDs
Instagram-scoped User IDs

When an Instagram user comments on a post, reel, or story, or sends a message to an Instagram professional account, an Instagram-scoped User ID is created that represents that person on that app. This ID is specific to the person and the Instagram account they are interacting with. This allows your app users, businesses and creators, to map interactions for the same person across multiple apps.

Page-scoped User IDs

When an Instagram user comments on a post, reel, or story, or sends a message to an Instagram professional account, an Page-scoped User ID is created that represents that person on that app. This ID is specific to the person and the Instagram account they are interacting with. This allows your app users, businesses and creators, to map interactions for the same person across multiple apps.

/me endpoint
The /me endpoint is a special endpoint that translates to the object ID of the account, Facebook Page or Instagram professional account, whose access token is currently being used to make the API calls. This special endpoint can also represent any ID, comments, conversations, media, posts, reels, and stories owned by your app user's Instagram professional account.

Messaging
An Instagram user sends a message to your app user's Instagram professional account while logged in to Instagram. The message is delivered to your app user's Instagram inbox and a webhook notification is sent to your server. Your app can use the API to respond within 24 hours. If more time is needed to allow a human agent to respond, you can use the human agent tag to send a response within 7 days.

If your app uses Facebook Login for Business, your app will use the Messenger Platform's Instagram Messaging API to send and receive messages.

Instagram Inbox

An Instagram professional account has a messaging inbox that allows you to control notifications and organize messages. By default notifications are off. You can turn notifications on in the Inbox Settings. The inbox is organized into different categories, Primary, General, and Requests. By default, all new conversations from followers will appear in the Primary folder. Conversations that existed before you implemented Instagram Messaging will be in the folders you have placed them within.

Messages that you receive from people who are not followers of your account are in Requests folder. You can choose to accept or deny these requests, and request messages aren’t marked as Seen until you accept them. Once a request is accepted you can move the conversation to the Primary or General folder. All message requests that you answer using a third-party app will be moved to the General folder.

Inbox Limitations

If you reply to a message using a third-party app, the conversation will be moved to the General folder regardless of your Setting configuration
Inbox folders are not supported and messages delivered by the Messenger Platform do not include folder information that is shown in the Instagram from Meta app inbox folder
Webhooks notifications or messages delivered via the API will not be considered as Read in the Instagram app inbox. Only after a reply is sent will a message be considered Read.
Automated Experiences
You can provide an escalation path for automated messaging experiences using one of the following:

A Single App – You can create a custom inbox to receive or reply to messages from a person. This custom inbox is powered by the same messaging app that also provides the automated experience
Multiple Apps – Handover Protocol  allows you pass the conversation from one app or inbox to another. For example, one app would handle the conversation with an automated experience and, when needed, would pass the conversation to another app to continue the conversation with a human agent.
Informing Users About Your Automated Experience
When required by applicable law, automated chat experiences must disclose that a person is interacting with an automated service:

at the beginning of any conversation or message thread,
after a significant lapse of time, or
when a chat moves from human interaction to automated experience.
Automated chat experiences that serve the following groups should pay special attention to this requirement:

California market or California users
German market or German users
Disclosures may include but are not limited to: “I’m the [Page Name] bot,”“You are interacting with an automated experience,” “You are talking to a bot,” or “I am an automated chatbot.”

Even where not legally required, we recommend informing users when they’re interacting with an automated chat as best practice, as this helps manage user expectations about their interaction with your messaging experience.

Visit our Developer Policies  for more information.

Policies
To gain and retain access to the Meta social graph you must adhere to the following:

Automated chats on Instagram 
Meta Platform Terms 
Developer Policies 
Community Standards 
Responsible Platform Initiatives 
Rate Limiting
All endpoints are subject to Instagram Business Use Case rate limiting except for Business Discovery and Hashtag Search endpoints, which are subject to Platform Rate limiting.

Calls to the Instagram Platform endpoints, excluding messaging, are counted against the calling app's call count. An app's call count is unique for each app and app user pair, and is the number of calls the app has made in a rolling 24 hour window. It is calculated as follows:

Calls within 24 hours = 4800 * Number of Impressions
The Number of Impressions is the number of times any content from the app user's Instagram professional account has entered a person's screen within the last 24 hours.

Notes
The Instagram Basic Display API uses Platform Rate Limits.
Business Discovery and Hashtag Search API are subject to Platform Rate Limits.
Messaging Rate Limits
Calls to the Instagram messaging endpoints are counted against the number of calls your app can make per Instagram professional account and the API used.

Conversations API
Your app can make 2 calls per second per Instagram professional account.
Private Replies API
Your app can make 100 calls per second per Instagram professional account for private replies to Instagram Live comments
Your app can make 750 calls per hour per Instagram professional account for private replies to comments on Instagram posts and reels
Send API
Your app can make 100 calls per second per Instagram professional account for messages that contain text, links, reactions, and stickers
Your app can make 10 calls per second per Instagram professional account for messages that contain audio or video content
Webhooks
We strongly recommend using webhooks to receive notifications about your app users' media objects or messages. Using webhooks will reduce the number of needed API calls made by your app and hence, reducing the risk of being rate limited.

Next steps
Now that you are familiar with the components of this API, set up your webhooks server and subscribe to events.

See also
Learn more about Meta's Graph API and the Messenger Platform.


Setup Webhooks Subscriptions
This document shows you how to create an endpoint on your server to receive webhook notifications from Meta and subscribe to webhook fields for an Instagram professional account using your app. This allows you to receive real-time notifications whenever someone comments on the Media objects of the Instagram professional account using your app, @mentions your app users, when your app users' Stories expire, or when a Instagram user sends a message to that Instagram professional account.

The steps
The steps required to receive webhook notifications are as follows:

Step 1. Create an endpoint on your server to receive webhooks from Meta
Verify requests from Meta – Occurs in the Meta App Dashboard
Accept and validate JSON payloads from Meta – Occurs on your server
Step 2. Subscribe your app to webhook fields – Occurs in the Meta App Dashboard
Step 3. Enable your app user's Instagram professional account to receive notifications via an API call to Meta
Sample app on Github
We provide a sample app on GitHub that deploys on Heroku which you can set up and repurpose, or which you can use to quickly test your Webhooks configuration.

You need the following:

A free Heroku account,
Your app's App Secret found on Meta App Dashboard App settings > Basic
A Verify token which is a string. In your Heroku app's settings, set up two config vars: APP_SECRET and TOKEN. Set APP_SECRET to your app's App Secret and TOKEN to your password. We will include this string in any verification requests when you configure the Webhooks product in the App Dashboard (the app will validate the request on its own).

View your Heroku app in a web browser. You should see an empty array ([]). This page will display newly received update notification data, so reload it throughout testing.

Your app's Callback URL will be your Heroku app's URL with /facebook added to the end. You will need this Callback URL during product configuration.
Copy the TOKEN value you set above; you'll also need this during product configuration.
What's in the Heroku sample app?
The app uses Node.js and these packages:

body-parser (for parsing JSON)
express (for routes)
express-x-hub (for SHA1 support)
Verifying the Sample App
You can easily verify that your sample app can receive Webhook events.

Under the Webhooks product in your App Dashboard, click the Test button for any of the Webhook fields.
A pop-up dialog will appear showing a sample of what will be sent. Click Send to My Server.
You should now see the Webhook information at the Heroku app's URL, or use curl https://<your-subdomain>.herokuapp.com in a terminal window.
Requirements
You will need:

Your app must be set to Live in the App Dashboard for Meta to send webhook notifications
Component	Business Login for Instagram	Facebook Login for Business	Instagram Messaging via Messenger Platform
Access level

Advanced Access

Advanced Access for comments and live_comments

Advanced Access

Access tokens

Instagram User access token

Facebook User or Page access token

Facebook User or Page access token

Business Verification

Required

Required

Required

Base URL

graph.instagram.com

graph.facebook.com

graph.facebook.com

Endpoints

/<INSTAGRAM_ACCOUNT_ID> or /me – Represents your app user's Instagram profession account

/<PAGE_ID> or /me – Represents the Facebook Page linked to your app user's Instagram professional account

/<PAGE_ID> or /me – Represents the Facebook Page linked to your app user's Instagram professional account

IDs

The ID of your app user's Instagram professional account

The ID of the Facebook Page linked to your app user's Instagram professional account

The ID of the Facebook Page linked to your app user's Instagram professional account

Basic Permission

instagram_business_basic	instagram_basic	instagram_basic
Field Specific Permissions

Refer the Instagram fields table

Refer the Instagram fields table

Refer the Instagram fields table

Limitations
Apps must be set to Live in the App Dashboard to receive webhook notifications.
Advanced Access is required to receive comments and live_comments webhook notifications.
The Instagram professional account that owns the media objects must be public to receive notifications for comments or @mentions.
Notifications for Comments on Live media are only sent during the live broadcast.
Account level webhooks customization is not supported. If your app user is subscribed to any Instagram webhook field, your app receives notifications for all fields the app is subscribed to.
Album IDs are not included in webhook notifications. Use the Comment ID received in the notification to get the album ID.
The ad ID will not be returned for media used in dynamic ads.
Create an Endpoint
This step must be completed before you can subscribe to any webhook fields in the App Dashboard.

Your endpoint must be able to process two types of HTTPS requests: Verification Requests and Event Notifications. Since both requests use HTTPs, your server must have a valid TLS or SSL certificate correctly configured and installed. Self-signed certificates are not supported.

The sections below explain what will be in each type of request and how to respond to them. Alternatively, you can use our sample app which is already configured to process these requests.

Verification Requests
Anytime you configure the Webhooks product in your App Dashboard, we'll send a GET request to your endpoint URL. Verification requests include the following query string parameters, appended to the end of your endpoint URL. They will look something like this:

Sample Verification Request
GET https://www.your-clever-domain-name.com/webhooks?
  hub.mode=subscribe&
  hub.challenge=1158201444&
  hub.verify_token=meatyhamhock
Parameter	Sample Value	Description
hub.mode

subscribe

This value will always be set to subscribe.

hub.challenge

1158201444

An int you must pass back to us.

hub.verify_token

meatyhamhock

A string that that we grab from the Verify Token field in your app's App Dashboard. You will set this string when you complete the Webhooks configuration settings steps.

Note: PHP converts periods (.) to underscores (_) in parameter names.

Validating Verification Requests
Whenever your endpoint receives a verification request, it must:

Verify that the hub.verify_token value matches the string you set in the Verify Token field when you configure the Webhooks product in your App Dashboard (you haven't set up this token string yet).
Respond with the hub.challenge value.
If you are in your App Dashboard and configuring your Webhooks product (and thus, triggering a Verification Request), the dashboard will indicate if your endpoint validated the request correctly. If you are using the Graph API's /app/subscriptions endpoint to configure the Webhooks product, the API will indicate success or failure with a response.

Event Notifications
When you configure your Webhooks product, you will subscribe to specific fields on an object type (e.g., the photos field on the user object). Whenever there's a change to one of these fields, we will send your endpoint a POST request with a JSON payload describing the change.

For example, if you subscribed to the user object's photos field and one of your app's Users posted a Photo, we would send you a POST request that would look something like this:

POST / HTTPS/1.1
Host: your-clever-domain-name.com/webhooks
Content-Type: application/json
X-Hub-Signature-256: sha256={super-long-SHA256-signature}
Content-Length: 311

{
  "entry": [
    {
      "time": 1520383571,
      "changes": [
        {
          "field": "photos",
          "value":
            {
              "verb": "update",
              "object_id": "10211885744794461"
            }
        }
      ],
      "id": "10210299214172187",
      "uid": "10210299214172187"
    }
  ],
  "object": "user"
}
Payload Contents
Payloads will contain an object describing the change. When you configure the webhooks product, you can indicate if payloads should only contain the names of changed fields, or if payloads should include the new values as well.

We format all payloads with JSON, so you can parse the payload using common JSON parsing methods or packages.

We do not store any Webhook event notification data that we send you, so be sure to capture and store any payload content that you want to keep.

Most payloads will contain the following common properties, but the contents and structure of each payload varies depending on the object fields you are subscribed to. Refer to each object's reference document to see which fields will be included.

Property	Description	Type
object

The object's type (e.g., user, page, etc.)

string

entry

An array containing an object describing the changes. Multiple changes from different objects that are of the same type may be batched together.

array

id

The object's ID

string

changed_fields

An array of strings indicating the names of the fields that have been changed. Only included if you disable the Include Values setting when configuring the Webhooks product in your app's App Dashboard.

array

changes

An array containing an object describing the changed fields and their new values. Only included if you enable the Include Values setting when configuring the Webhooks product in your app's App Dashboard.

array

time

A UNIX timestamp indicating when the Event Notification was sent (not when the change that triggered the notification occurred).

int

Validating Payloads
We sign all Event Notification payloads with a SHA256 signature and include the signature in the request's X-Hub-Signature-256 header, preceded with sha256=. You don't have to validate the payload, but you should.

To validate the payload:

Generate a SHA256 signature using the payload and your app's App Secret.
Compare your signature to the signature in the X-Hub-Signature-256 header (everything after sha256=). If the signatures match, the payload is genuine.
Responding to Event Notifications
Your endpoint should respond to all Event Notifications with 200 OK HTTPS.

Frequency
Event Notifications are aggregated and sent in a batch with a maximum of 1000 updates. However batching cannot be guaranteed so be sure to adjust your servers to handle each Webhook individually.

If any update sent to your server fails, we will retry immediately, then try a few more times with decreasing frequency over the next 36 hours. Your server should handle deduplication in these cases. Unacknowledged responses will be dropped after 36 hours.

Note: The frequency with which Messenger event notifications are sent is different. Please refer to the Messenger Platform Webhooks documentation for more information.

Enable Subscriptions
Your app must enable subscriptions by sending a POST request to the /me/subscribed_apps endpoint with the subscribed_fields parameter set to a comma-separated list of webhooks fields.

Request Syntax
Formatted for readability.

POST /me/subscribed_apps
  ?subscribed_fields=<LIST_OF_WEBHOOK_FIELDS>
  &<ACCESS_TOKEN>
Request Parameters
Value Placeholder	Value Description
/me

Represents your app user's Instagram professional account ID or the Facebook Page ID that is linked to your app user's Instagram professional account

<ACCESS_TOKEN>

App user's Instagram User access token or Facebook Page access token.

<LIST_OF_WEBHOOK_FIELDS>

A comma-separated list of webhook fields that your app is subscribed to.

Example Request
Formatted for readability.

curl -i -X POST \
  "https://graph.instagram.com/v22.0/1755847768034402/subscribed_apps
  ?subscribed_fields=comments,messages
  &access_token=EAAFB..."
On success, your app receives a JSON response with success set to true.

{
  "success": true
}
Subscribe to webhook fields
You can subscribe to the following fields to receive notifications for events that take place on Instagram.

Instagram Webhook field
Instagram API setup with Instagram Login permissions	Instagram API setup with Facebook Login permissions	Instagram Messaging API (Messenger Platform) permissions
comments

instagram_business_basic
instagram_business_manage_comments
instagram_basic
instagram_manage_comments
pages_manage_metadata
pages_read_engagement
pages_show_list
x
live_comments

instagram_business_basic
instagram_business_manage_comments
instagram_basic
instagram_manage_comments
pages_manage_metadata
pages_read_engagement
pages_show_list
x
mentions

Included in the comments webhook notification

instagram_basic
instagram_manage_comments
pages_manage_metadata
pages_read_engagement
pages_show_list
x
message_echoes

instagram_business_basic
instagram_business_manage_comments
x
Included in the messages webhook notification

message_reactions

instagram_business_basic
instagram_business_manage_messages
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
messages

instagram_business_basic
instagram_business_manage_messages
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
messaging_handover

instagram_business_basic
instagram_business_manage_messages
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
messaging_optins

instagram_business_basic
instagram_business_manage_messages
x
x
messaging_policy_enforcement

x
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
messaging_postbacks

instagram_business_basic
instagram_business_manage_messages
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
messaging_referral

instagram_business_basic
instagram_business_manage_messages
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
messaging_seen

instagram_business_basic
instagram_business_manage_messages
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
response_feedback

x
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
standby

instagram_business_basic
instagram_business_manage_messages
x
instagram_basic
instagram_manage_messages
pages_manage_metadata
pages_read_engagement
pages_show_list
story_insights

x
instagram_basic
instagram_manage_insights
pages_manage_metadata
pages_read_engagement
pages_show_list
x
Next steps
Learn how to send and receive messages from Instagram professional accounts

See also
Webhooks from Meta | Developer Documentation 


Instagram Platform Webhook Notification Examples
This guide contains example JSON payloads for Instagram webhook notifications sent from Meta when a webhook field has been triggered. Syntax returned in notifications vary slightly depending on log in type implemented in your app and triggering event.

Business Login for Instagram
The following notification examples are for apps that have implemented Business Login for Instagram.

Common parameters of notifications

object string

Platform on which the webhook event was triggered. In this instance, instagram.

entry.id string

The Instagram professional account ID of your app user

entry.time int

The time Meta sent the notification

entry array of objects

An array containing the contents of the notification

entry array of objects

An array containing the contents of the notification

[
  {
    "object":"instagram",
    "entry":[
      {
        "id":"<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",
        "time":<TIME_META_SENT_THIS_NOTIFICATION>,
        <NOTIFICATION_PAYLOAD>
      }
    ]
  } 
]
Comments payload
The comment event notification payloads include the following:

field set to comments or live_comments
value set to an array that contains:
The comment ID
The Instagram-scoped user ID of the Instagram user who commented on your app user's media
The username of the Instagram user who commented on your app user's media
Any text that was included in the comment
The media's ID
Where the media was located, in an ad, feed, story, or reel
[
  {
    "object": "instagram",
    "entry": [
      {
        "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",
        "time": <TIME_META_SENT_THIS_NOTIFICATION>

    // Comment or live comment payload
        "field": "comments",
        "value": {
          "id": "<COMMENT_ID>",
          "from": {
            "id": "<INSTAGRAM_SCOPED_USER_ID>",
            "username": "<USERNAME>"
          },
          "text": "<COMMENT_TEXT>",
          "media": {
            "id": "<MEDIA_ID>",
            "media_product_type": "<MEDIA_PRODUCT_TYPE>"
          }
        }
      }
    ]
  }
]
Messaging payload
All messaging webhook notifications included the following:

object set to instagram
entry set to an array containing:
The Instagram professional account ID of your app user who is in the conversation
The time Meta sent the notification
The sender's ID
The recipient's ID
The time when the message was sent
The notification payload for the specific webhook that was triggered
[
  {
    "object":"instagram",
    "entry":[
      {
        "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",
        "time": <TIME_META_SENT_NOTIFICATION>,
        "messaging": [
          {
            "sender": { "id": "<SENDER_ID>" },
            "recipient": { "id": "<RECIPIENT_ID>" },
            "timestamp": <TIME_WEBHOOK_WAS_TRIGGERED>
            <NOTIFICATION_PAYLOAD>
          }
        ]
      }
    ]
  }
]
Identifying the values for the multiple ids within a notification can be confusing since the recipient and sender can vary depending on the action that triggered the webhook. The following table shows the action that triggered the webhook and the ID set for each id parameter.

Action that triggers a messaging webhook	
id
recipient.id
sender.id
Your app user receives a message from an Instagram user

Your app user's Instagram professional account ID

Your app user's Instagram professional account ID

The Instagram user's Instagram-scoped ID

Your app user sends a message to an Instagram user

Your app user's Instagram professional account ID

The Instagram user's Instagram-scoped ID

Your app user's Instagram professional account ID

message
The message event notification payloads include the following:

message set to object that contains data about the message that was sent with:
mid set to the message ID that was sent
The payload might also include the following depending on the contents of the message:

text included when the message contains text
is_deleted set to true is included when the Instagram user deleted the message
is_echo set to true is included when the message was sent by your app user
is_unsupported set to true when the message contains unsupported media
quick_reply set to an object with payload set to the payload your app user wants to see for the quick reply chosen by the Instagram user
referral set to an object that includes information about the CTD ad the Instagram user clicked:
ref set to the ref parameter value of the ad, if set by your app user
ad_id set to the ad ID
source set to ADS
type set to OPEN_THREAD
ads_context_data set to an object that contains the ad title, photo url if the Instagram user clicked an image in the ad or video url if the Instagram user clicked a video in the ad
reply_to set to an object with the message ID if the user sends an inline reply
reply_to set to an object with a story object that include the URL of the story and the story ID
attachments set to an array that includes one or more objects with the type of media, audio, file, image (image or sticker), share, story_mention, video, ig_reel or reel and the payload that contains the URL for the media.
[
  {
    "object":"instagram",
    "entry":[
      {
        "id":"<YOUR_APP_USERS_INSTAGRAM_USER_ID>",
        "time":<TIME_NOTIFICATION_WAS_SENT>,
        "messaging":[
          {
            "sender":{ "id":"<SENDER_ID>" },
            "recipient":{ "id":"<RECIPIENT_ID>" },
            "timestamp":<TIME_WEBHOOK_WAS_TRIGGERED>,
  
  // <MESSAGE_WEBHOOK_PAYLOAD> 
            "message": { 
              "mid": "<MESSAGE_ID>",
  
 // Optional parameters included for specific message types
  
              "attachments": [
                {                             
                  "type":"<ATTACHMENT_MEDIA_TYPE>",
                  "payload":{ "url":"<URL_FOR_THE_MEDIA>" }  
                },
                // Can include multiple media objects
              ],
  
              "is_deleted": true,   
  
              "is_echo": true,       

              "is_unsupported": true,
  
              "quick_reply": { "payload": "<QUICK_REPLY_OPTION_SELECTED>" }, 

              "referral": {
                "ref": "<AD_REF_PARAMETER_VALUE_IF_SET>"
                "ad_id": "<AD_ID>",
                "source": "ADS",
                "type": "OPEN_THREAD",
                "ads_context_data": {
                  "ad_title": "<AD_TITLE>",
                  "photo_url": "<IMAGE_URL_THAT_WAS_SELECTED>",
                  "video_url": "<THUMBNAIL_URL_FOR_THE_AD_VIDEO>",
                }
              },

              "reply_to":{ "mid":"<MESSAGE_ID>" } 
  
              "reply_to": {
              "story": {
                "url":"<CDN_URL_FOR_THE_STORY>",
                "id":"<STORY_ID>"       
              }
            }
  
              "text": "<MESSAGE_TEXT>",
  
          }
        }
      ]
    }
  ]
}
message_reactions
The message_reactions event notification payloads include the following:

reaction set to an object with the following:
mid set to the message ID
action set to react or unreact, if removing a reaction
If reacting, reaction set to love and emoji set to \u{2764}\u{FE0F}
{
  "object": "instagram",
  "entry": [
    {
      "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>",  // ID for your app user's Instagram Professional account
      "time": 1569262486134,
      "messaging": [
        {
          "sender": {
            "id": "<INSTAGRAM_SCOPED_ID>"  // Instagram-scoped ID for the Instagram user who sent the message
          },
          "recipient": {
            "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>"  // ID for your app user's Instagram Professional account
          },
          "timestamp": 1569262485349,
          "reaction" :{
            "mid" : "<MESSAGE_ID>",
            "action": "react",          // or unreact if removing the reaction
            "reaction": "love",         // Not included when action is unreact
            "emoji": "\u{2764}\u{FE0F}" // Not included when action is unreact
          } 
        }
      ]
    }
  ]
}  
messaging_postbacks
The messaging_postbacks event notification payloads include the following:

postback set to an object with:
mid set to the message ID
title set to the icebreaker or CTA button the Instagram user selected
payload set to the payload your app user wants to receive for that selection
{
  "object": "instagram",
  "entry": [
    {
      "id": "<INSTAGRAM_SCOPED_ID>",  // ID of your app user's Instagram Professional account
      "time": 1502905976963,
      "messaging": [
        {
          "sender": { "id": "<INSTAGRAM_SCOPED_ID>" },    // Instagram-scoped ID for the Instagram user who sent the message
          "recipient": { "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>" },  // ID of your app user's Instagram Professional account
          "timestamp": 1502905976377,
          "postback": {
            "mid":"<MESSAGE_ID>",           // ID for the message sent to your app user
            "title": "<USER_SELECTED_ICEBREAKER_OPTION_OR_CTA_BUTTON>",
            "payload": "<OPTION_OR_BUTTON_PAYLOAD>",  // The payload with the option selected by the Instagram user
          }
        }
      ]
    }
  ]
}
messaging_referral
The messaging_referral event notification payloads include the following:

referral set to an object with:
ref set to the value of the ref parameter in your ig.me link that an Instagram user clicked
source set to the ig.me link that was clicked by an Instagram user
type set to OPEN_THREAD when a message is part of an existing conversation
{
  "object": "instagram",
  "entry": [
    {
      "id": "<INSTAGRAM_SCOPED_ID>",  // ID of your Instagram Professional account  
      "time": 1502905976963,
      "messaging": [
        {
          "sender": {
            "id": "<INSTAGRAM_SCOPED_ID>"  // Instagram-scoped ID for the Instagram user who sent the message
          },
          "recipient": {
            "id": "<YOUR_APP_USERS_INSTAGRAM_USER_ID>"  // ID of your Instagram Professional account
          },
          "timestamp": 1502905976377,
          "referral": {
                 "ref": "<IGME_LINK_REF_PARAMETER_VALUE>"
                 "source": "<IGME_SOURCE_LINK>"  
                 "type":  "OPEN_THREAD"  // Included when a message is part of an existing conversation
          }
        }
      ]
    }
  ]
}
messaging_seen
The messaging_seen event notification payloads include the following:

read set to an object with:
mid set to the message ID that was read
{
   "object":"instagram",
   "entry":[
      {
         "id":"<YOUR_APP_USERS_INSTAGRAM_USER_ID>",     // ID for your app user's Instagram Professional account
         "time":1569262486134,
         "messaging":[
            {
               "sender":{
                  "id":"<INSTAGRAM_SCOPED_ID>"  // Instagram-scoped ID for the Instagram user who sent the message
               },
               "recipient":{
                  "id":"<YOUR_APP_USERS_INSTAGRAM_USER_ID>"  // ID for your app user's Instagram Professional account
               },
               "timestamp":1569262485349,
               "read":{
                  "mid":"<MESSAGE_ID>"  // ID for the message that was seen
               }
            }
         ]
      }
   ]
}
Facebook Login for Business
[
  {
    "object": "instagram",
    "entry": [
      {
        "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",      // ID of your app user's Instagram professional account
        "time": <TIME_META_SENT_THIS_NOTIFICATION>              // Time Meta sent the notification
        "changes": [
          {
            "field": "<WEBHOOK_FIELD>",
            "value": {
             
              <NOTIFICATION_PAYLOAD>
    
            }
          }
        ]
      }
    ]
  }
]
comments
[
  {
    "object": "instagram",
    "entry": [
      {
        "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",      // ID of your app user's Instagram professional account
        "time": <TIME_META_SENT_THIS_NOTIFICATION>          // Time Meta sent the notification
        "changes": [
          {
            "field": "comments",
            "value": {
              "from": {
                "id": "<INSTAGRAM_USER_SCOPED_ID>",         // Instagram-scoped ID of the Instagram user who made the comment
                "username": "<INSTAGRAM_USER_USERNAME>"     // Username of the Instagram user who made the comment
              }',
              "comment_id": "<COMMENT_ID>",                 // Comment ID of the comment with the mention
              "parent_id": "<PARENT_COMMENT_ID>",           // Parent comment ID, included if the comment was made on a comment
              "text": "<TEXT_ID>",                          // Comment text, included if comment included text
              "media": {                                       
                "id": "<MEDIA_ID>",                             // Media's ID that was commented on
                "ad_id": "<AD_ID>",                             // Ad's ID, included if the comment was on an ad post
                "ad_title": "<AD_TITLE_ID>",                    // Ad's title, included if the comment was on an ad post
                "original_media_id": "<ORIGINAL_MEDIA_ID>",     // Original media's ID, included if the comment was on an ad post
                "media_product_type": "<MEDIA_PRODUCT_ID>"      // Product ID, included if the comment was on a specific product in an ad
              }
            }
          }
        ]
      }
    ]
  }
]
live_comments
Facebook Login for Business objects
[
  {
    "object": "instagram",
    "entry": [
      {
        "id": "<YOUR_APP_USERS_INSTAGRAM_ACCOUNT_ID>",      // ID of your app user's Instagram professional account
        "time": <TIME_META_SENT_THIS_NOTIFICATION>          // Time Meta sent the notification
        "changes": [
          {
            "field": "live_comments",
            "value": {
              "from": {
                "id": "<INSTAGRAM_USER_SCOPED_ID>",         // Instagram-scoped ID of the Instagram user who made the comment
                "username": "<INSTAGRAM_USER_USERNAME>"     // Username of the Instagram user who made the comment
              }',
              "comment_id": "<COMMENT_ID>",                 // Comment ID of the comment with the mention
              "parent_id": "<PARENT_COMMENT_ID>",           // Parent comment ID, included if the comment was made on a comment
              "text": "<TEXT_ID>",                          // Comment text, included if comment included text
              "media": {                                       
                "id": "<MEDIA_ID>",                             // Media's ID that was commented on
                "ad_id": "<AD_ID>",                             // Ad's ID, included if the comment was on an ad post
                "ad_title": "<AD_TITLE_ID>",                    // Ad's title, included if the comment was on an ad post
                "original_media_id": "<ORIGINAL_MEDIA_ID>",     // Original media's ID, included if the comment was on an ad post
                "media_product_type": "<MEDIA_PRODUCT_ID>"      // Product ID, included if the comment was on a specific product in an ad
              }
            }
          }
        ]
      }
    ]
  }
]
mentions on media
Business Login for Instagram objects

@mention on apps that use Business Login for Instagram are included in the comments notifications.

Facebook Login for Business objects
[
  {
    "entry": [
      {
        "changes": [
          {
            "field": "mentions",
            "value": {
              "media_id": "17918195224117851"   // ID of the media where your app user's Instagram professional account was mentioned
            }
          }
        ],
        "id": "17841405726653026",   // ID of your app user's Instagram professional account
        "time": 1520622968           // The time Meta sent the notification
      }
    ],
    "object": "instagram"
  }
]
mentions on comments
Business Login for Instagram objects

@mention on apps that use Business Login for Instagram are included in the comments notifications.

Facebook Login for Business objects
[
  {
    "entry": [
      {
        "changes": [
          {
            "field": "mentions",
            "value": {
              "comment_id": "17894227972186120",  // ID of the comment in which your app user's Instagram professional account was mentioned
              "media_id": "17918195224117851"     // ID of the media the Instagram user commented on
            }
          }
        ],
        "id": "17841405726653026",   // ID of your app user's Instagram professional account
        "time": 1520622968           // Time the notification was sent
      }
    ],
    "object": "instagram"
  }
]
Insights
story_insights