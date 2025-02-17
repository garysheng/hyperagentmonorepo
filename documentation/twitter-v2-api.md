# API v1.1

This is a comprehensive guide of all methods available for the Twitter API v1.1 on `twitter-api-v2` package.

> Every presented method in this guide is attached to **v1 client**, that you can access through `client.v1`.
>
> If you don't find the endpoint you want, don't panic! It probably hasn't been implemented yet.
> You can make your request manually using generic requests handlers `.get`, `.post`, `.put`, `.patch` and `.delete` methods.
> See the [HTTP wrappers](./http-wrappers.md) documentation.

*Argument note*: Described arguments often refers to an interface name. Generally, argument type is a `Partial<>` (all properties are optionals) of the given interface.

*Return type note*: All return types are wrapped inside `Promise`s.

For streaming API, see [Streaming part](./streaming.md).

<!-- vscode-markdown-toc -->
* [Tweet timelines](#tweet-timelines)
	* [Home timeline](#home-timeline)
	* [Mention timeline](#mention-timeline)
	* [User timeline](#user-timeline)
		* [By user id](#by-user-id)
		* [By username](#by-username)
	* [Favorites timeline](#favorites-timeline)
		* [By user id](#by-user-id-1)
		* [By username](#by-username-1)
* [Post and retrieve tweets](#post-and-retrieve-tweets)
	* [Create a tweet](#create-a-tweet)
	* [Reply to a tweet](#reply-to-a-tweet)
	* [Post a thread of tweets](#post-a-thread-of-tweets)
	* [Delete a tweet](#delete-a-tweet)
	* [Embed a tweet](#embed-a-tweet)
	* [Get a single tweet](#get-a-single-tweet)
	* [Get multiple tweets](#get-multiple-tweets)
* [Users](#users)
	* [Get single user](#get-single-user)
	* [Get a bunch of users](#get-a-bunch-of-users)
	* [Search users](#search-users)
	* [Report user as spam](#report-user-as-spam)
	* [List muted users (objects)](#list-muted-users-objects)
	* [List muted users (IDs)](#list-muted-users-ids)
  	* [Get ids of followers of a user](#get-ids-of-followers-of-a-user)
  	* [Get ids of friends of a user](#get-ids-of-friends-of-a-user)
    * [List of followers of the specified user (objects)](#list-of-followers-of-the-specified-user-objects)
  	* [List of friends of the specified user (objects)](#list-of-followers-of-the-specified-user-objects)
	* [Get sizes of profile banner of a user](#get-sizes-of-profile-banner-of-a-user)
	* [Get detailed relationship between two users](#get-detailed-relationship-between-two-users)
	* [Update relationship between you and other user](#update-relationship-between-you-and-other-user)
	* [Follow a user](#follow-a-user)
	* [Unfollow a user](#unfollow-a-user)
	* [Get relationships between you and other users](#get-relationships-between-you-and-other-users)
	* [Get users with disabled retweets](#get-users-with-disabled-retweets)
	* [List received follow requests](#list-received-follow-requests)
	* [List sent follow requests](#list-sent-follow-requests)
* [Account](#account)
	* [Get account settings](#get-account-settings)
	* [Update account settings](#update-account-settings)
	* [Update account profile](#update-account-profile)
	* [Update current profile image](#update-current-profile-image)
	* [Update current profile banner](#update-current-profile-banner)
	* [Remove current profile banner](#remove-current-profile-banner)
* [Upload medias](#upload-medias)
	* [Upload a picture/video/subtitle to Twitter](#upload-a-picturevideosubtitle-to-twitter)
	* [Media info](#media-info)
	* [Create media metadata](#create-media-metadata)
	* [Create media subtitle](#create-media-subtitle)
	* [Delete media subtitle](#delete-media-subtitle)
* [Account settings](#account-settings)
	* [Get logged user](#get-logged-user)
* [Direct Messages (DMs)](#direct-messages-dms)
	* [Send a new direct message to someone](#send-a-new-direct-message-to-someone)
	* [Get a single DM by id](#get-a-single-dm-by-id)
	* [Delete / hide a DM](#delete--hide-a-dm)
	* [List sent and received DMs](#list-sent-and-received-dms)
	* [Download a media attached in a DM](#download-a-media-attached-in-a-dm)
	* [Create a welcome direct message](#create-a-welcome-direct-message)
	* [Get a welcome direct message (that you own)](#get-a-welcome-direct-message-that-you-own)
	* [Delete a welcome direct message (that you own)](#delete-a-welcome-direct-message-that-you-own)
	* [Update a welcome direct message (that you own)](#update-a-welcome-direct-message-that-you-own)
	* [List your welcome DMs](#list-your-welcome-dms)
	* [Create a welcome direct message rule](#create-a-welcome-direct-message-rule)
	* [Get a welcome direct message rule](#get-a-welcome-direct-message-rule)
	* [Delete a welcome direct message rule](#delete-a-welcome-direct-message-rule)
	* [List your welcome DM rules](#list-your-welcome-dm-rules)
	* [Set the active visible welcome DM](#set-the-active-visible-welcome-dm)
	* [Mark a received DM as read in a conversation](#mark-a-received-dm-as-read-in-a-conversation)
	* [Indicate that user is typing in a conversation](#indicate-that-user-is-typing-in-a-conversation)
* [Lists](#lists)
	* [Get information about a list](#get-information-about-a-list)
	* [Get list of lists of user](#get-list-of-lists-of-user)
	* [Members of a list](#members-of-a-list)
	* [Get a single member of list](#get-a-single-member-of-list)
	* [Subscribers of a list](#subscribers-of-a-list)
	* [Get a single subscriber of list](#get-a-single-subscriber-of-list)
	* [List memberships](#list-memberships)
	* [List ownerships](#list-ownerships)
	* [List subscriptions](#list-subscriptions)
	* [Tweet timeline of a list](#tweet-timeline-of-a-list)
	* [Create a list](#create-a-list)
	* [Update list metadata](#update-list-metadata)
	* [Delete list](#delete-list)
	* [Add list members](#add-list-members)
	* [Remove list members](#remove-list-members)
	* [Subscribe to a list](#subscribe-to-a-list)
	* [Unsubscribe of a list](#unsubscribe-of-a-list)
* [Trends](#trends)
	* [Trends by place location](#trends-by-place-location)
	* [Current trends](#current-trends)
	* [Trends near geo point](#trends-near-geo-point)
* [Geo places](#geoplaces)
	* [Get a place by id](#get-a-place-by-ID)
	* [Search for places using a bunch of parameters](#search-for-places-using-a-bunch-of-parameters)
* [Developer utilities](#developer-utilities)
	* [Get rate limit statuses](#get-rate-limit-statuses)
	* [Supported languages on Twitter](#supported-languages-on-twitter)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## Tweet timelines

### Home timeline

Logged user home timeline.
Get to know how [paginators work here](./paginators.md).

Tweet mode is `extended` by default.

**Method**: `.homeTimeline()`

**Endpoint**: `statuses/home_timeline.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: TweetV1TimelineParams`

**Returns**: `HomeTimelineV1Paginator`

**Example**
```ts
const homeTimeline = await client.v1.homeTimeline({ exclude_replies: true });

// Consume every possible tweet of homeTimeline (until rate limit is hit)
for await (const tweet of homeTimeline) {
  console.log(tweet);
}
```

### Mention timeline

Logged user received mentions.
Get to know how [paginators work here](./paginators.md).

Tweet mode is `extended` by default.

**Method**: `.mentionTimeline()`

**Endpoint**: `statuses/mentions_timeline.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: TweetV1TimelineParams`

**Returns**: `MentionTimelineV1Paginator`

**Example**
```ts
const mentionTimeline = await client.v1.mentionTimeline({ trim_user: true });
const fetchedTweets = mentionTimeline.tweets;
```

### User timeline

#### By user id

Last posted tweets of `userId` user.
Get to know how [paginators work here](./paginators.md).

Tweet mode is `extended` by default.

**Method**: `.userTimeline()`

**Endpoint**: `statuses/user_timeline.json`

**Right level**: `Read-only`

**Arguments**:
  - `userId: string`
  - `options?: TweetV1UserTimelineParams`

**Returns**: `UserTimelineV1Paginator`

**Example**
```ts
const userTimeline = await client.v1.userTimeline('12', { include_entities: true });
const fetchedTweets = userTimeline.tweets;
```

#### By username

Last posted tweets of @`username` user.
Get to know how [paginators work here](./paginators.md).

Tweet mode is `extended` by default.

**Method**: `.userTimelineByUsername()`

**Endpoint**: `statuses/user_timeline.json`

**Right level**: `Read-only`

**Arguments**:
  - `username: string`
  - `options?: TweetV1UserTimelineParams`

**Returns**: `UserTimelineV1Paginator`

**Example**
```ts
const userTimeline = await client.v1.userTimelineByUsername('plhery');
const fetchedTweets = userTimeline.tweets;
```

### Favorites timeline

#### By user id

Last favorited tweets of `userId` user.
Get to know how [paginators work here](./paginators.md).

Tweet mode is `extended` by default.

**Method**: `.favoriteTimeline()`

**Endpoint**: `favorites/list.json`

**Right level**: `Read-only`

**Arguments**:
  - `userId: string`
  - `options?: TweetV1UserTimelineParams`

**Returns**: `UserFavoritesV1Paginator`

**Example**
```ts
const favoritesTimeline = await client.v1.favoriteTimeline('12');
const fetchedTweets = favoritesTimeline.tweets;
```

#### By username

Last favorited tweets of @`username` user.
Get to know how [paginators work here](./paginators.md).

Tweet mode is `extended` by default.

**Method**: `.favoriteTimelineByUsername()`

**Endpoint**: `favorites/list.json`

**Right level**: `Read-only`

**Arguments**:
  - `username: string`
  - `options?: TweetV1UserTimelineParams`

**Returns**: `UserFavoritesV1Paginator`

**Example**
```ts
const favoritesTimeline = await client.v1.favoriteTimelineByUsername('plhery');
const fetchedTweets = favoritesTimeline.tweets;
```

## Post and retrieve tweets

### Create a tweet

Post a new tweet.
Tweet mode is `extended` by default.

**Method**: `.tweet()`

**Endpoint**: `statuses/update.json`

**Right level**: `Read-write`

**Arguments**:
  - `status: string`
  - `payload?: SendTweetV1Params`

**Returns**: `TweetV1`: Created tweet

**Example**
```ts
const createdTweet = await client.v1.tweet('twitter-api-v2 is awesome!', {
  lat: 1.23,
  long: -13.392,
});
console.log('Tweet', createdTweet.id_str, ':', createdTweet.full_text);
```

### Reply to a tweet

Alias to a `.tweet` with `in_reply_to_status_id` already set and
`auto_populate_reply_metadata` set to `true`.

Tweet mode is `extended` by default.

**Method**: `.reply()`

**Endpoint**: `statuses/update.json`

**Right level**: `Read-write`

**Arguments**:
  - `status: string`
  - `in_reply_to_status_id: string`
  - `payload?: SendTweetV1Params`

**Returns**: `TweetV1`: Created tweet

**Example**
```ts
await client.v1.reply(
  'reply to previously created tweet.',
  createdTweet.id_str,
);
```

### Post a thread of tweets

Post multiple tweets at one time.
Tweet mode is `extended` by default.

**Method**: `.tweetThread()`

**Endpoint**: `statuses/update.json`

**Right level**: `Read-write`

**Arguments**:
  - `tweets: (SendTweetV1Params | string)[]`

**Returns**: `TweetV1[]`: Created tweets (in the right order), first sent first position

**Example**
```ts
const mediaId = await client.v1.uploadMedia('./image.png');

await client.v1.tweetThread([
  'Hello, lets talk about Twitter!',
  { status: 'Twitter is a fantastic social network. Look at this:', media_ids: mediaId },
  'This thread is automatically made with twitter-api-v2 :D',
]);
```

### Delete a tweet

Delete a tweet that belongs to you.
Tweet mode is `extended` by default.

**Method**: `.deleteTweet()`

**Endpoint**: `statuses/destroy/:id.json`

**Right level**: `Read-write`

**Arguments**:
  - `tweetId: string`

**Returns**: `TweetV1`: Deleted tweet object

**Example**
```ts
const deletedTweet = await client.v1.deleteTweet('20');
console.log('Deleted tweet', deletedTweet.id_str, ':', deletedTweet.full_text);
```

### Embed a tweet

Returns a single Tweet, specified by either a Tweet web URL or the Tweet ID, in an oEmbed-compatible format.

**Method**: `.oembedTweet()`

**Endpoint**: `oembed` (publish.x.com)

**Right level**: `Read-only`

**Arguments**:
  - `tweetId: string`
  - `options?: OembedTweetV1Params`

**Returns**: `OembedTweetV1Result`: oEmbed tweet

**Example**
```ts
const tweet = await client.v1.oembedTweet('20');
console.log('Tweet HTML:', tweet.html);
```

### Get a single tweet

Returns a single Tweet by ID.

**Method**: `.singleTweet()`

**Endpoint**: `statuses/show.json`

**Right level**: `Read-only`

**Arguments**:
  - `tweetId: string`
  - `options?: TweetShowV1Params`

**Returns**: `TweetV1`

**Example**
```ts
const tweet = await client.v1.singleTweet('20');
console.log(tweet.full_text);
```

### Get multiple tweets

Returns multiple Tweet by IDs.

**Method**: `.tweets()`

**Endpoint**: `statuses/lookup.json`

**Right level**: `Read-only`

**Arguments**:
  - `ids: string | string[]`
  - `options?: TweetLookupV1Params`

**Returns**: `TweetV1[]` (if `options.map` is `false` or not specified), `TweetLookupMapV1Result` (if `options.map` is `true`)

**Example**
```ts
const tweets = await client.v1.tweets(['12', '20']);
console.log(tweets[0].full_text); // 'just setting up my twttr'

const tweetMaps = await client.v1.tweets(['12', '20'], { map: true });
console.log(tweets.id[12]); // null
```


## Users

### Get single user

Get a single user object by ID or screen name.

**Method**: `.user()`

**Endpoint**: `users/show.json`

**Right level**: `Read-only`

**Arguments**:
  - `user: UserShowV1Params`

**Returns**: `UserV1`

**Example**
```ts
const jack = await client.v1.user({ user_id: '12' });
```

### Get a bunch of users

Get multiple user objects by ID or screen name.

**Method**: `.users()`

**Endpoint**: `users/lookup.json`

**Right level**: `Read-only`

**Arguments**:
  - `query: UserLookupV1Params`

**Returns**: `UserV1[]`

**Example**
```ts
const users = await client.v1.users({ user_id: ['12', '20'] });
```

### Search users

Search users with a query.
Get to know how [paginators work here](./paginators.md).

To access user objects from the paginator, use `.users` property.

Tweet mode is `extended` by default.

**Method**: `.searchUsers()`

**Endpoint**: `users/search.json`

**Right level**: `Read-only`

**Arguments**:
  - `query: string`
  - `options?: UserSearchV1Params`

**Returns**: `UserSearchV1Paginator` (containing `UserV1` objects)

**Example**
```ts
const foundUsers = await client.v1.searchUsers('alki');
console.log('First page of found users:', foundUsers.users);
```

### Report user as spam

Report user as spam to Twitter, and optionally block it.

**Method**: `.reportUserAsSpam()`

**Endpoint**: `users/report_spam.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: ReportSpamV1Params`

**Returns**: `UserV1`: Reported user

**Example**
```ts
await client.v1.reportUserAsSpam({ user_id: '12' });
```

### List muted users (objects)

Muted users by the authenticating users.
Get to know how [paginators work here](./paginators.md).

To access user objects from the paginator, use `.users` property.

Tweet mode is `extended` by default.

**Method**: `.listMutedUsers()`

**Endpoint**: `mutes/users/list.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: MuteUserListV1Params`

**Returns**: `MuteUserListV1Paginator` (containing `UserV1` objects)

**Example**
```ts
const mutedUsers = await client.v1.listMutedUsers();
console.log('First page of muted users:', mutedUsers.users);
console.log('Second page of muted users:', (await mutedUsers.next()).users);
```

### List muted users (IDs)

Muted users by the authenticating users (IDs only).
Get to know how [paginators work here](./paginators.md).

To access user IDs from the paginator, use `.ids` property.

**Method**: `.listMutedUserIds()`

**Endpoint**: `mutes/users/ids.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: MuteUserIdsV1Params`

**Returns**: `MuteUserIdsV1Paginator` (containing `string` items)

**Example**
```ts
const mutedUsers = await client.v1.listMutedUserIds();
console.log('First page of muted user ids:', mutedUsers.ids);
console.log('Second page of muted user ids:', (await mutedUsers.next()).ids);
```

### Get ids of followers of a user

Get ids of followers of the specified user (IDs only).
Get to know how [paginators work here](./paginators.md).

To access user IDs from the paginator, use `.ids` property.

**Method**: `.userFollowerIds()`

**Endpoint**: `followers/ids.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: UserFollowerIdsV1Params`

**Returns**: `UserFollowerIdsV1Paginator` (containing `string` items)

**Example**
```ts
const followers = await client.v1.userFollowerIds({ screen_name: 'WSJ' });
console.log('First page of follower ids of "WSJ" user:', followers.ids);
console.log('Second page of follower ids of "WSJ" user:', (await followers.next()).ids);
```

### Get ids of friends of a user

Get ids of friends of the specified user (IDs only).
Get to know how [paginators work here](./paginators.md).

To access user IDs from the paginator, use `.ids` property.

**Method**: `.userFollowingIds()`

**Endpoint**: `friends/ids.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: UserFollowersIdsV1Params`

**Returns**: `UserFollowerIdsV1Paginator` (containing `string` items)

**Example**
```ts
const friends = await client.v1.userFriendIds({ screen_name: 'WSJ' });
console.log('First page of friend ids of "WSJ" user:', friends.ids);
console.log('Second page of friend ids of "WSJ" user:', (await friends.next()).ids);
```

### List of followers of the specified user (objects)

Get an array of user objects for users following the specified user.
Get to know how [paginators work here](./paginators.md).

To access user IDs from the paginator, use `.users` property.

**Method**: `.userFollowerList()`

**Endpoint**: `followers/list.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: UserFollowerListV1Params`

**Returns**: `UserFollowerListV1Paginator` (containing `string` items)

**Example**
```ts
const followers = await client.v1.userFollowerList({ screen_name: 'WSJ' });
console.log('First page of follower of "WSJ" user:', followers.users);
console.log('Second page of follower of "WSJ" user:', (await followers.next()).users);
```

### List of friends of the specified user (objects)

Get an array of user objects for every user the specified user is following (otherwise known as their "friends").
Get to know how [paginators work here](./paginators.md).

To access user IDs from the paginator, use `.users` property.

**Method**: `.userFriendList()`

**Endpoint**: `friends/list.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: UserFriendListV1Params`

**Returns**: `UserFriendListV1Paginator` (containing `string` items)

**Example**
```ts
const friends = await client.v1.userFriendList({ screen_name: 'WSJ' });
console.log('First page of friends of "WSJ" user:', friends.users);
console.log('Second page of friends of "WSJ" user:', (await friends.next()).users);
```

### Get sizes of profile banner of a user

**Method**: `.userProfileBannerSizes()`

**Endpoint**: `users/profile_banner.json` (GET)

**Right level**: `Read-only`

**Arguments**:
  - `options: ProfileBannerSizeV1Params`

**Returns**: `ProfileBannerSizeV1`

**Example**
```ts
const { sizes } = await client.v1.userProfileBannerSizes({ user_id: '12' });
console.log(sizes.web_retina);
```

### Get detailed relationship between two users

Get a detailed relationship object between two arbitrary users.

**Method**: `.friendship()`

**Endpoint**: `friendships/show.json`

**Right level**: `Read-only`

**Arguments**:
  - `sources: FriendshipShowV1Params`

**Returns**: `FriendshipV1`

**Example**
```ts
const { relationship } = await client.v1.friendship({ source_id: '12', target_id: '20' });
if (relationship.target.following) {
  console.log(`User #12 is following #20.`);
}
```

### Update relationship between you and other user

Turn on/off Retweets and device notifications from the specified user.

**Method**: `.updateFriendship()`

**Endpoint**: `friendships/update.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: FriendshipUpdateV1Params`

**Returns**: `FriendshipV1`

**Example**
```ts
// Enable device notifications for user #12
await client.v1.updateFriendship({ user_id: '12', device: true });
```

### Follow a user

Follow the specified user.

**Method**: `.createFriendship()`

**Endpoint**: `friendships/create.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: FriendshipCreateV1Params`

**Returns**: `FriendshipCreateOrDestroyV1`

**Example**
```ts
// Follows the user with screen_name 'WSJ'
await client.v1.createFriendship({ screen_name: 'WSJ' });
```

### Unfollow a user

Unfollow the specified user.

**Method**: `.destroyFriendship()`

**Endpoint**: `friendships/destroy.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: FriendshipDestroyV1Params`

**Returns**: `FriendshipCreateOrDestroyV1`

**Example**
```ts
// Unfollows the user with screen_name 'WSJ'
await client.v1.destroyFriendship({ screen_name: 'WSJ' });
```

### Get relationships between you and other users

Get a lookup relationship objects between logged user and other users.

**Method**: `.friendships()`

**Endpoint**: `friendships/lookup.json`

**Right level**: `Read-only`

**Arguments**:
  - `friendships: FriendshipLookupV1Params`

**Returns**: `FriendshipLookupV1[]`

**Example**
```ts
const friendships = await client.v1.friendships({ user_id: ['12', '20'] });

for (const friendship of friendships) {
  if (friendship.connections.includes('following')) {
    console.log(`You are following @${friendship.screen_name}.`);
  }
}
```

### Get users with disabled retweets

Get a list of user IDs whose have disabled RTs in logged user timelines.

**Method**: `.friendshipsNoRetweets()`

**Endpoint**: `friendships/no_retweets/ids.json`

**Right level**: `Read-only`

**Arguments**: None

**Returns**: `string[]`

**Example**
```ts
const disabledRtUserIds = await client.v1.friendshipsNoRetweets();
// You can then obtain user info through .v1.users() or .v2.users()...
```

### List received follow requests

Follow requests from users (IDs only, as a paginator).
Get to know how [paginators work here](./paginators.md).

To access user IDs from the paginator, use `.ids` property.

**Method**: `.friendshipsIncoming()`

**Endpoint**: `friendships/incoming.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: FriendshipsIncomingV1Params`

**Returns**: `FriendshipsIncomingV1Paginator` (containing `string` items)

**Example**
```ts
const incomingFriendships = await client.v1.friendshipsIncoming();
// Get user objects
console.log(await client.v1.users({ user_id: incomingFriendships.ids }));
```

### List sent follow requests

Follow requests to other users (IDs only, as a paginator).
Get to know how [paginators work here](./paginators.md).

To access user IDs from the paginator, use `.ids` property.

**Method**: `.friendshipsOutgoing()`

**Endpoint**: `friendships/outgoing.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: FriendshipsIncomingV1Params`

**Returns**: `FriendshipsOutgoingV1Paginator` (containing `string` items)

**Example**
```ts
const sentFollowRequests = await client.v1.friendshipsOutgoing();
// Get user objects
console.log(await client.v1.users({ user_id: sentFollowRequests.ids }));
```

## Account

### Get account settings

Get current logged user account settings

**Method**: `.accountSettings()`

**Endpoint**: `account/settings.json` (GET)

**Right level**: `Read-only`

**Arguments**: None

**Returns**: `AccountSettingsV1`: Settings

**Example**
```ts
const settings = await client.v1.accountSettings();
console.log(settings.language);
```

### Update account settings

Update current logged user account settings

**Method**: `.updateAccountSettings()`

**Endpoint**: `account/settings.json` (POST)

**Right level**: `Read-write`

**Arguments**:
  - `options: AccountSettingsV1Params`

**Returns**: `AccountSettingsV1`: Settings

**Example**
```ts
const settings = await client.v1.updateAccountSettings({ lang: 'fr' });
console.log(settings.language); // 'fr'
```

### Update account profile

Sets some values that users are able to set under the "Account" tab of their settings page.

**Method**: `.updateAccountProfile()`

**Endpoint**: `account/update_profile.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: AccountProfileV1Params`

**Returns**: `UserV1`

**Example**
```ts
const loggedUser = await client.v1.updateAccountProfile({ name: 'Twitter API v2', url: 'https://www.npmjs.com/package/twitter-api-v2' });
console.log(loggedUser.name); // 'Twitter API v2'
```

### Update current profile image

**Method**: `.updateAccountProfileImage()`

**Endpoint**: `account/update_profile_image.json`

**Right level**: `Read-write`

**Arguments**:
  - `file: TUploadableMedia`: Link to a file to upload (file path, `Buffer`, `fs` file handle)
  - `options?: ProfileImageUpdateV1Params`

**Returns**: `UserV1`: Logged user object

**Example**
```ts
await client.v1.updateAccountProfileImage('./my-pp.jpg');
```

### Update current profile banner

**Method**: `.updateAccountProfileBanner()`

**Endpoint**: `account/update_profile_banner.json`

**Right level**: `Read-write`

**Arguments**:
  - `file: TUploadableMedia`: Link to a file to upload (file path, `Buffer`, `fs` file handle)
  - `options?: ProfileBannerUpdateV1Params`

**Returns**: None

**Example**
```ts
await client.v1.updateAccountProfileBanner('./my-banner.jpg', { offset_top: 640, offset_left: 400 });
```

### Remove current profile banner

**Method**: `.removeAccountProfileBanner()`

**Endpoint**: `account/remove_profile_banner.json`

**Right level**: `Read-write`

**Arguments**: None

**Returns**: None

**Example**
```ts
await client.v1.removeAccountProfileBanner();
```


## Upload medias

### Upload a picture/video/subtitle to Twitter

Upload a new media or subtitle to Twitter.
Automatically handle chunked upload and upload commands for you.

By default, file type is detected using **file extension**.
If you don't upload a file using file path, or if file path doesn't include the file extension,
you **must** specify the file type using `options.type`.

**Method**: `.uploadMedia()`

**Endpoint**: `media/upload.json`

**Right level**: `Read-write`

**Arguments**:
  - `file: string | number | Buffer | fs.promises.FileHandle`: File path (`string`) or file description (`number`) or raw file (`Buffer`) or file handle (`fs.promises.FileHandle`)
  - `options?: UploadMediaV1Params`
    - `options.mimeType` MIME type as a string. To help you across allowed MIME types, enum `EUploadMimeType` is here for you.
      This option is **required if file is not specified as `string`**.
    - `options.target` Target type `tweet` or `dm`. Defaults to `tweet`. **You must specify it if you send a media to use in DMs.**
    - `options.longVideo` Specify `true` here if you're sending a video and it can exceed 120 seconds. Otherwise, this option has no effet.
    - `options.shared` Specify `true` here if you want to use this media in Welcome Direct Messages.
    - `options.additionalOwners` List of user IDs (except you) allowed to use the new media ID.
    - `options.maxConcurrentUploads` Number of concurrent chunk uploads allowed to be sent. Defaults to `3`.
- `returnFullMediadata` If set to true, returns the whole media information instead of just the media_id.

**Returns**: `string`: Media ID to give to tweets/DMs

**Example**
```ts
// Through explicit file path
const mediaId = await client.v1.uploadMedia('image.png');
const newTweet = await client.v1.tweet('Hello!', { media_ids: mediaId });

// Through file path with no extension
import { fileTypeFromFile } from 'file-type'; // You can use file-type to guess the file content

const path = '149e4f3.tmp';
const mediaId = await client.v1.uploadMedia(path, { mimeType: (await fileTypeFromFile(path)).mime });

// Through a Buffer
const mediaId = await client.v1.uploadMedia(Buffer.from([...]), { mimeType: EUploadMimeType.Png });
```

### Media info

Get media information/processing status from a media ID.
Media IDs returned by `.uploadMedia()` already awaits for processing status to be `succeeded`,
you don't need to call this method by yourself.

**Method**: `.mediaInfo()`

**Endpoint**: `media/upload.json`

**Right level**: `Read-only`

**Arguments**:
  - `mediaId: string`

**Returns**: `MediaStatusV1Result`

**Example**
```ts
const info = await client.v1.mediaInfo('19849289324');

if (info.processing_info?.state === 'succeeded') {
  // Media already processed by Twitter, ok to send it
}
```

### Create media metadata

Add alt text to posted GIF/images.

**Method**: `.createMediaMetadata()`

**Endpoint**: `media/metadata/create.json`

**Right level**: `Read-write`

**Arguments**:
  - `mediaId: string`
  - `metadata: MediaMetadataV1Params`

**Returns**: Nothing

**Example**
```ts
await client.v1.createMediaMetadata('19849289324', { alt_text: { text: 'A pinguin.' } });
```

### Create media subtitle

Attach a subtitle to a posted video.
You must upload the subtitle with `.uploadMedia()` first.

It can be bound before and after the publication of the video inside a tweet.

**Method**: `.createMediaSubtitles()`

**Endpoint**: `media/subtitles/create.json`

**Right level**: `Read-write`

**Arguments**:
  - `mediaId: string`
  - `subtitles: MediaSubtitleV1Param[]`

**Returns**: Nothing

**Example**
```ts
const videoMediaId = await client.v1.uploadMedia('./big-buck-bunny.mp4');
const subtitleMediaId = await client.v1.uploadMedia('./subtitles.srt');

// Attach your subtitles
await client.v1.createMediaSubtitles(videoMediaId, [
  { media_id: subtitleMediaId, language_code: 'fr', display_name: 'Français' },
]);
```

### Delete media subtitle

Remove a previously bound subtitle to a posted video.
Subtitle has been uploaded with `.uploadMedia()` first.

It can be unbound before and after the publication of the video inside a tweet.

**Method**: `.deleteMediaSubtitles()`

**Endpoint**: `media/subtitles/delete.json`

**Right level**: `Read-write`

**Arguments**:
  - `mediaId: string`: Video media ID
  - `...languages: string[]`: Languages codes

**Returns**: Nothing

**Example**
```ts
const videoMediaId = await client.v1.uploadMedia('./big-buck-bunny.mp4');

// ... after upload ...
await client.v1.deleteMediaSubtitles(videoMediaId, 'fr', 'en');
```


## Account settings

### Get logged user

**Method**: `.verifyCredentials()`

**Endpoint**: `account/verify_credentials.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: VerifyCredentialsV1Params`

**Returns**: `UserV1`

**Example**
```ts
const loggedUser = await client.v1.verifyCredentials();
// or its shortcut
const loggedUser = await client.currentUser();
```

## Direct Messages (DMs)

### Send a new direct message to someone

**Method**: `.sendDm()`

**Endpoint**: `direct_messages/events/new.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `options: SendDMV1Params`

**Returns**: `DirectMessageCreateV1Result`

**Example**
```ts
const recipientId = '12';

const dmSent = await client.v1.sendDm({
  // Mandatory
  recipient_id: recipientId,
  // Other parameters are collapsed into {message_data} of payload
  text: 'Hello Jack!',
  attachment: {
    type: 'media',
    media: { id: '24024092' },
  },
});

dmSent.event[EDirectMessageEventTypeV1.Create].message_data.text === 'Hello Jack!'; // true!
```

### Get a single DM by id

**Method**: `.getDmEvent()`

**Endpoint**: `direct_messages/events/show.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `id: string`

**Returns**: `ReceivedDMEventV1`

**Example**
```ts
const directMessage = await client.v1.getDmEvent('<DM-ID>');

const messageSender = directMessage.event[EDirectMessageEventTypeV1.Create].sender_id;
```

### Delete / hide a DM

**Method**: `.deleteDm()`

**Endpoint**: `direct_messages/events/destroy.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `id: string`

**Returns**: `void`

**Example**
```ts
await client.v1.deleteDm('<DM-ID>');
```

### List sent and received DMs

This isn't sorted by conversation, you will get all events *sent* and *received* in any conversation.

**Method**: `.listDmEvents()`

**Endpoint**: `direct_messages/events/list.json`

**Right level**: `Read-write + DM`

**Arguments**: None.

**Returns**: `DmEventsV1Paginator`

**Example**
```ts
const eventsPaginator = await client.v1.listDmEvents();

for await (const event of eventsPaginator) {
  if (event.type === EDirectMessageEventTypeV1.Create) {
    console.log('Sender ID is', event[EDirectMessageEventTypeV1.Create].sender_id);
  }
}
```

### Download a media attached in a DM

Medias linked to direct messages are protected under user authentication on Twitter.
You can download them using this wrapper which handles the OAuth boilerplate for you.

**Method**: `.downloadDmImage()`

**Endpoint**: *None*

**Right level**: `Read-write + DM`

**Arguments**:
  - `urlOrDm: string | DirectMessageCreateV1`: Direct media URL or direct message. Message must contain an attachment.

**Returns**: `Buffer`

**Example**
```ts
const eventsPaginator = await client.v1.listDmEvents();

for await (const event of eventsPaginator) {
  // If message is a direct message and has an attachment
  if (event.type === EDirectMessageEventTypeV1.Create && event[EDirectMessageEventTypeV1.Create].message_data.attachment) {
    const image = await client.v1.downloadDmImage(event);
  }
}
```

### Create a welcome direct message

A welcome direct message is a message that will automatically greet users who want to
interact with the logged account. You must "activate" the welcome direct message by creating
a "welcome direct message rule" (see below).

**Method**: `.newWelcomeDm()`

**Endpoint**: `direct_messages/welcome_messages/new.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `name: string`
  - `data: MessageCreateDataV1`: The `message_data` property of the payload.

**Returns**: `WelcomeDirectMessageCreateV1Result`

**Example**
```ts
const welcomeDm = await client.v1.newWelcomeDm('welcome dm 1', {
  text: 'Welcome! Please tell us whats the problem? You can also view your support page.',
  ctas: [{
    type: 'web_url',
    url: 'https://example.com/your_support.php',
    label: 'Our support page',
  }],
});

console.log(welcomeDm[EDirectMessageEventTypeV1.WelcomeCreate].message_data.text);
```

### Get a welcome direct message (that you own)

A welcome direct message is a message that will automatically greet users who want to
interact with the logged account.

**Method**: `.getWelcomeDm()`

**Endpoint**: `direct_messages/welcome_messages/show.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `id: string`

**Returns**: `WelcomeDirectMessageCreateV1Result`

**Example**
```ts
const welcomeDm = await client.v1.getWelcomeDm('<DM-ID>');
```

### Delete a welcome direct message (that you own)

**Method**: `.deleteWelcomeDm()`

**Endpoint**: `direct_messages/welcome_messages/destroy.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `id: string`

**Returns**: `void`

**Example**
```ts
await client.v1.deleteWelcomeDm(welcomeDm[EDirectMessageEventTypeV1.WelcomeCreate].id);
```

### Update a welcome direct message (that you own)

**Method**: `.updateWelcomeDm()`

**Endpoint**: `direct_messages/welcome_messages/update.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `id: string`
  - `data: MessageCreateDataV1`: The `message_data` property of the payload.

**Returns**: `WelcomeDirectMessageCreateV1Result`

**Example**
```ts
await client.v1.updateWelcomeDm(welcomeDm[EDirectMessageEventTypeV1.WelcomeCreate].id, {
  ...welcomeDm[EDirectMessageEventTypeV1.WelcomeCreate].message_data,
  text: 'Another text for welcome Dm.',
});
```

### List your welcome DMs

**Method**: `.listWelcomeDms()`

**Endpoint**: `direct_messages/welcome_messages/list.json`

**Right level**: `Read-write + DM`

**Arguments**: None.

**Returns**: `WelcomeDmV1Paginator`

**Example**
```ts
const welcomeDms = await client.v1.listWelcomeDms();

for await (const welcomeDm of welcomeDms) {
  console.log(welcomeDm.id, welcomeDm.message_data.text, welcomeDm.name);
}
```

---------

### Create a welcome direct message rule

This will "enable" a desired welcome direct message. The related message will automatically show up on new conversations.

***A rule shouldn't already exist!***.

**Method**: `.newWelcomeDmRule()`

**Endpoint**: `direct_messages/welcome_messages/rules/new.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `welcomeMessageId: string`

**Returns**: `WelcomeDmRuleV1Result`

**Example**
```ts
const rule = await client.v1.newWelcomeDmRule(welcomeDm[EDirectMessageEventTypeV1.WelcomeCreate].id);
console.log(rule.welcome_message_rule.id, rule.welcome_message_rule.welcome_message_id);
```

### Get a welcome direct message rule

**Method**: `.getWelcomeDmRule()`

**Endpoint**: `direct_messages/welcome_messages/rules/show.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `id: string`

**Returns**: `WelcomeDmRuleV1Result`

**Example**
```ts
const rule = await client.v1.getWelcomeDmRule(rule.welcome_message_rule.id);
```

### Delete a welcome direct message rule

**Method**: `.deleteWelcomeDmRule()`

**Endpoint**: `direct_messages/welcome_messages/rules/destroy.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `id: string`

**Returns**: `void`

**Example**
```ts
await client.v1.deleteWelcomeDmRule(rule.welcome_message_rule.id);
```

### List your welcome DM rules

In fact, you can only have one unique rule set. So this endpoint will either return a empty object,
or an object with a single-element array.

**Method**: `.listWelcomeDmRules()`

**Endpoint**: `direct_messages/welcome_messages/rules/list.json`

**Right level**: `Read-write + DM`

**Arguments**: None.

**Returns**: `WelcomeDmRuleListV1Result`

**Example**
```ts
const rules = await client.v1.listWelcomeDmRules();

if (rules.welcome_message_rules?.length) {
  const activeRule = rules.welcome_message_rules[0];
}
```

### Set the active visible welcome DM

This helper will do the job for you if you want to properly set an active rule given a created welcome message.

It will:
- List the existing welcome DM rules
- For each rule, delete the rule *and the associated welcome DM if `deleteAssociatedWelcomeDmWhenDeletingRule` is `true` (default)*.
- Then, create the new welcome DM rule with the given welcome DM ID.

**Method**: `.setWelcomeDm()`

**Endpoint**: Combinations of multiple endpoints

**Right level**: `Read-write + DM`

**Arguments**:
  - `welcomeMessageId: string`
  - `deleteAssociatedWelcomeDmWhenDeletingRule?: boolean = true`

**Returns**: `WelcomeDmRuleV1Result`

**Example**
```ts
await client.v1.setWelcomeDm(welcomeDm[EDirectMessageEventTypeV1.WelcomeCreate].id);
```

### Mark a received DM as read in a conversation

**Method**: `.markDmAsRead()`

**Endpoint**: `direct_messages/mark_read.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `lastEventId: string`
  - `recipientId: string` (recipient of the conversation, not the message!)

**Returns**: `void`

**Example**
```ts
const eventData = directMessage.event[EDirectMessageEventTypeV1.Create];
await client.v1.markDmAsRead(directMessage.event.id, eventData.sender_id);
```

### Indicate that user is typing in a conversation

**Method**: `.indicateDmTyping()`

**Endpoint**: `direct_messages/indicate_typing.json`

**Right level**: `Read-write + DM`

**Arguments**:
  - `recipientId: string` (recipient of the conversation)

**Returns**: `void`

**Example**
```ts
const eventData = directMessage.event[EDirectMessageEventTypeV1.Create];
await client.v1.indicateDmTyping(eventData.sender_id);
```


## Lists

### Get information about a list

**Method**: `.list()`

**Endpoint**: `lists/show.json`

**Right level**: `Read-only`

**Arguments**:
  - `options: GetListV1Params`

**Returns**: `ListV1`

**Example**
```ts
const myList = await client.v1.list({ list_id: '148292589' });
const myListBySlug = await client.v1.list({ slug: 'cats', owner_screen_name: 'jack' });
```

### Get list of lists of user

Returns all lists the authenticating or specified user subscribes to, including their own.
If no options are provided, return the list of lists of authenticated user.

**Method**: `.lists()`

**Endpoint**: `lists/list.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: ListListsV1Params`

**Returns**: `ListV1[]`

**Example**
```ts
const myLists = await client.v1.lists();
const listsOfJack = await client.v1.lists({ user_id: '12' });
```

### Members of a list

Returns the members of the specified list.

**Method**: `.listMembers()`

**Endpoint**: `lists/members.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: ListMembersV1Params`

**Returns**: `ListMembersV1Paginator` (containing `UserV1` objects)

**Example**
```ts
const myLists = await client.v1.lists();

for (const list of myLists) {
  const members = await client.v1.listMembers({ list_id: list.id_str });

  for await (const user of members) {
    console.log(user);
  }
}
```

### Get a single member of list

**Method**: `.listGetMember()`

**Endpoint**: `lists/members/show.json`

**Right level**: `Read-only`

**Arguments**:
  - `options: ListMemberShowV1Params`

**Returns**: `UserV1`

**Example**
```ts
const jack = await client.v1.listGetMember({ list_id: '148292589', user_id: '12' });
```

### Subscribers of a list

Returns the subscribers of the specified list.

**Method**: `.listSubscribers()`

**Endpoint**: `lists/subscribers.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: ListMembersV1Params`

**Returns**: `ListSubscribersV1Paginator` (containing `UserV1` objects)

**Example**
```ts
const myLists = await client.v1.lists();

for (const list of myLists) {
  const subs = await client.v1.listSubscribers({ list_id: list.id_str });

  for await (const user of subs) {
    console.log(user);
  }
}
```

### Get a single subscriber of list

**Method**: `.listGetSubscriber()`

**Endpoint**: `lists/subscribers/show.json`

**Right level**: `Read-only`

**Arguments**:
  - `options: ListMemberShowV1Params`

**Returns**: `UserV1`

**Example**
```ts
const jack = await client.v1.listGetSubscriber({ list_id: '148292589', user_id: '12' });
```

### List memberships

Returns lists where the specified user is classified as member.

**Method**: `.listMemberships()`

**Endpoint**: `lists/memberships.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: ListMembershipsV1Params`

**Returns**: `ListMembershipsV1Paginator` (containing `ListV1` objects)

**Example**
```ts
const listsWhereJackIsPresent = await client.v1.listMemberships({ user_id: '12' });

for await (const list of listsWhereJackIsPresent) {
  console.log(list);
}
```

### List ownerships

Returns lists owned by the specified user.

**Method**: `.listOwnerships()`

**Endpoint**: `lists/ownerships.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: ListOwnershipsV1Params`

**Returns**: `ListOwnershipsV1Paginator` (containing `ListV1` objects)

**Example**
```ts
const listsOfJack = await client.v1.listOwnerships({ user_id: '12' });

for await (const list of listsOfJack) {
  console.log(list);
}
```

### List subscriptions

Returns lists subscribed by a specified user.

**Method**: `.listSubscriptions()`

**Endpoint**: `lists/subscriptions.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: ListSubscriptionsV1Params`

**Returns**: `ListSubscriptionsV1Paginator` (containing `ListV1` objects)

**Example**
```ts
const listsSubscribedByJack = await client.v1.listSubscriptions({ user_id: '12' });

for await (const list of listsSubscribedByJack) {
  console.log(list);
}
```

### Tweet timeline of a list

Returns lists subscribed by a specified user.

**Method**: `.listStatuses()`

**Endpoint**: `lists/statuses.json`

**Right level**: `Read-only`

**Arguments**:
  - `options?: ListStatusesV1Params`

**Returns**: `ListTimelineV1Paginator` (containing `TweetV1` objects)

**Example**
```ts
const tweetsOfList = await client.v1.listStatuses({ list_id: '124829' });

for await (const tweet of tweetsOfList) {
  console.log(tweet);
}
```

### Create a list

**Method**: `.createList()`

**Endpoint**: `lists/create.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: ListCreateV1Params`

**Returns**: `ListV1`

**Example**
```ts
const myNewList = await client.v1.createList({ name: 'cats', mode: 'private' });
```

### Update list metadata

**Method**: `.updateList()`

**Endpoint**: `lists/update.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: UpdateListV1Params`

**Returns**: `ListV1`

**Example**
```ts
const updatedList = await client.v1.updateList({ list_id: '128492', mode: 'public' });
```

### Delete list

**Method**: `.removeList()`

**Endpoint**: `lists/destroy.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: GetListV1Params`

**Returns**: `ListV1`

**Example**
```ts
await client.v1.removeList({ list_id: '128492' });
```

### Add list members

Automatically choose between `create` or `create_all` if you add a single or multiple users.

**Method**: `.addListMembers()`

**Endpoint**: `lists/members/create.json` or `lists/members/create_all.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: AddOrRemoveListMembersV1Params`

**Returns**: None

**Example**
```ts
// will use 'create'
await client.v1.addListMembers({ list_id: '128492', user_id: '12' });
// will use 'create_all'
await client.v1.addListMembers({ list_id: '128492', user_id: ['12', '20'] });
```

### Remove list members

Automatically choose between `destroy` or `destroy_all` if you remove a single or multiple users.

**Method**: `.removeListMembers()`

**Endpoint**: `lists/members/destroy.json` or `lists/members/destroy_all.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: AddOrRemoveListMembersV1Params`

**Returns**: None

**Example**
```ts
// will use 'destroy'
await client.v1.removeListMembers({ list_id: '128492', user_id: '12' });
// will use 'destroy_all'
await client.v1.removeListMembers({ list_id: '128492', user_id: ['12', '20'] });
```

### Subscribe to a list

**Method**: `.subscribeToList()`

**Endpoint**: `lists/subscribers/create.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: GetListV1Params`

**Returns**: `ListV1`

**Example**
```ts
await client.v1.subscribeToList({ list_id: '128492' });
```

### Unsubscribe of a list

**Method**: `.unsubscribeOfList()`

**Endpoint**: `lists/subscribers/destroy.json`

**Right level**: `Read-write`

**Arguments**:
  - `options: GetListV1Params`

**Returns**: `ListV1`

**Example**
```ts
await client.v1.unsubscribeOfList({ list_id: '128492' });
```


## Trends

### Trends by place location

**Method**: `.trendsByPlace()`

**Endpoint**: `trends/place.json`

**Right level**: `Read-only`

**Arguments**:
  - `woeId: string | number`: Where On Earth Identifier
  - `options?: TrendsPlaceV1Params`

**Returns**: `TrendMatchV1[]`

**Example**
```ts
// Trends of New York
const trendsOfNy = await client.v1.trendsByPlace(2459115);

for (const { trends, created_at } of trendsOfNy) {
  for (const trend of trends) {
    console.log('Trend', trend.name, 'created at', created_at);
  }
}
```

### Current trends

**Method**: `.trendsAvailable()`

**Endpoint**: `trends/available.json`

**Right level**: `Read-only`

**Arguments**: None

**Returns**: `TrendLocationV1[]`

**Example**
```ts
const currentTrends = await client.v1.trendsAvailable();

for (const { name, country } of currentTrends) {
  console.log('Trend', name, 'is *trendy* in', country);
}
```

### Trends near geo point

Trends nears a lat/long couple.

**Method**: `.trendsClosest()`

**Endpoint**: `trends/closest.json`

**Right level**: `Read-only`

**Arguments**:
  - `latitude: number`
  - `longitude: number`

**Returns**: `TrendLocationV1[]`

**Example**
```ts
const trends = await client.v1.trendsClosest(-18.183, 4.24);
```


## Geo places

### Get a place by id

**Method**: `.geoPlace()`

**Endpoint**: `geo/id/:id.json`

**Right level**: `Read-only`

**Arguments**:
  - `placeId: string`

**Returns**: `PlaceV1`

**Example**
```ts
const place = await client.v1.geoPlace('189384');
console.log(place.full_name, place.url);
```

### Search for places using a bunch of parameters

**Method**: `.geoReverseGeoCode()`

**Endpoint**: `geo/reverse_geocode.json`

**Right level**: `Read-only`

**Arguments**:
  - `options: ReverseGeoCodeV1Params`

**Returns**: `ReverseGeoCodeV1Result`

**Example**
```ts
const { result } = await client.v1.geoReverseGeoCode({ lat: 1.329, long: -13.3 });
for (const place of result.places) {
  console.log(place); // PlaceV1
}
```


## Developer utilities

### Get rate limit statuses

**Method**: `.rateLimitStatuses()`

**Endpoint**: `application/rate_limit_status.json`

**Right level**: `Read-only`

**Arguments**:
  - `...resources: TAppRateLimitResourceV1[]`

**Returns**: `AppRateLimitV1Result`

**Example**
```ts
const { resources } = await client.v1.rateLimitStatuses('users', 'statuses', 'help');

for (const endpoint in resources.users) {
  console.log(
    'User endpoint',
    endpoint,
    ', remaining calls',
    resources.users[endpoint].remaining,
  );
}
```

### Supported languages on Twitter

**Method**: `.supportedLanguages()`

**Endpoint**: `help/languages.json`

**Right level**: `Read-only`

**Arguments**: None

**Returns**: `HelpLanguageV1Result[]`

**Example**
```ts
const langs = await client.v1.supportedLanguages();

for (const { code, name } of langs) {
  console.log('Lang', name, ': code', code);
}
```