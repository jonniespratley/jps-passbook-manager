# Overview
There are three major parts to the pass life cycle: creation, management, and redemption. Passbook handles the middle; it lets users view and manage their passes and provides lock screen integration. You are responsible for the two ends: creating passes and redeeming passes.




* What your product can do
* If your product is what they’ve been looking for
* If your product will help users accomplish their tasks - This
* Whether or not they should join your service or pay for your product
* Address issues or concerns up front
* Address the top concerns your users might have when they are trying to decide whether or not to use your product or not. 
* “Is it safe”, 
* “Can I import my app easily?”, 
* “Can I export my app if I decide to move?”.  
 


## Getting Started
This is a simple web app interface for creating iOS Passbook passes from content.


### 1. Fork It
Clone or fork this repo. 

Execute command:

	$ git clone https://github.com/jonniespratley/jps-passbook-manager.git


### 2. Install It
You must install the dependencys for this node.js application to work properly.

Execute command:

	$ npm install


### 3. Start It
Then start the passbook manager and web service api server.

Execute command:
	
	$ node server
	
You should see the following output:

	$ node server
	Passbook Manager & API Server listening on port 4040
	
Open your browser to localhost:4040

----
	
## How To
	
### Creating a pass
Just use the form to create your pass and save it.

### Signing a pass
Just use the manager to sign your passes, or execute this command:

	./signpass -p Name.pass

	

## Documentation
Please refer to the Apple Passbook Programming guide for more detail information.

### Pass Style Sets the Overall Visual Appearance

The pass’s style determines the overall visual appearance of the pass and the template for placement of information on the pass. The most distinctive visual indication of the style is at the top edge of the pass: event tickets have a small cutout, coupons have a perforated edge, and so on.

Unlike pass type identifiers, which you define, the pass styles are part of the API, as is their meaning. There is no facility for you to change them or add new ones. Pass type identifiers categorize passes in a very specific way; pass styles categorize passes in a much more general high-level way.

You specify the pass style by providing the corresponding key at the top level of the pass.json file:

Boarding passes use the key boardingPass. This pass style is appropriate for passes used with transit systems such as train tickets, airline boarding passes, and other types of transit. Typically each pass corresponds to a single trip with a specific starting and ending point.
Coupons use the key coupon. This pass style is appropriate for coupons, special offers, and other discounts.
Event tickets use the key eventTicket. This pass style is appropriate for passes used to gain entry to an event like a concert, a movie, a play, or a sporting event. Typically each pass corresponds to a specific event, but you can also use a single pass for several events as in a season ticket.
Store cards use the key storeCard. This pass style is appropriate for store loyalty cards, discount cards, points cards, and gift cards. Typically a store identifies an account the user has with your company that can be used to make payments or receive discounts. When the account carries a balance, the current balance should appear on the pass.
Generic passes use the key generic. This pass style is appropriate for any pass that doesn’t fit into one of the other more specific styles—for example, gym membership cards, coat check claim tickets, and metro passes that carry a balance.
The value of this key is a dictionary containing the fields that hold the pass content. Listing 3-1 shows a pass that uses the boarding pass style, with a placeholder for the field dictionaries.


Table 3-1  Pass styles, images, and layout
Pass style
Supported images
Layout
Boarding pass
logo, icon, footer
See Figure 3-2
Coupon
logo, icon, strip
See Figure 3-3
Event ticket
logo, icon, strip, background, thumbnail
If you specify a strip image, do not specify a background image or a thumbnail.
See Figure 3-4
Generic
logo, icon, thumbnail
See Figure 3-5
Store card
logo, icon, strip

## Examples
![image](http://developer.apple.com/library/ios/documentation/userexperience/conceptual/PassKit_PG/Art/boarding_pass_2x.png)

![image](http://developer.apple.com/library/ios/documentation/userexperience/conceptual/PassKit_PG/Art/coupon_2x.png)

![image](http://developer.apple.com/library/ios/documentation/userexperience/conceptual/PassKit_PG/Art/generic_2x.png)

![image](http://developer.apple.com/library/ios/documentation/userexperience/conceptual/PassKit_PG/Art/event_ticket_2x.png)

![image](http://developer.apple.com/library/ios/documentation/userexperience/conceptual/PassKit_PG/Art/store_card_2x.png)

### Pass for a One-Time-Use Coupon
Suppose you want to give out a coupon for 10 percent off that can only be used once. You include a unique number on each coupon from 1 to 500, and you write the numbers 1 through 500 on a piece of paper next to the cash register. When the cashiers ring up a coupon, they consult the paper and cross off that coupon’s number.

This works on a very small scale, and illustrates the principle of a central trusted authority. You don’t control what your customers do with their passes or devices (or even with their paper coupons) so you can’t use that as a starting point for trusting information. Instead, you trust your database, and use the pass as a quick way to look up a particular record. The data in the pass itself is just a snapshot of some particular database state.

Doing it with passes is similar: the pass includes a unique ID in its barcode, and your server keeps track of which passes are still valid. At the point of redemption, you scan the barcode and consult your server to determine whether the pass is valid.

Don’t try to make a one-time-use pass by only giving the pass to a single device. Users with multiple iOS devices want your pass on all of their devices and iCloud syncs their passes across devices for them. If you email your pass to your users, they can forward the email and its pass. Your scanning and redemption system is responsible for implementing policies like “this pass is only valid once”.

Don’t try to expire or void a pass by pushing an update. Updates are not guaranteed to be delivered: the user may not have a network connection or may have disabled updates for the pass. Instead, update your database to indicate that the pass is invalid, and consult your database when the pass is redeemed. Additionally, your app should not remove expired passes without the user’s consent.

### Pass for a Store Card with a Balance
Suppose you own a coffee shop and your customers typically pay with a card carries a balance, such as a gift card or store card. Similar to the one-time-use pass, you need a piece of information and it must come from a trustworthy source. In that case you needed to know whether the pass was still valid; in this case you want to know the pass’s current balance.

The implementation is similar. Each pass has a unique ID in the barcode which is scanned at the point of sale. Before completing the sale, you consult your server to record the transaction and update the balance. Once this is done, the cashier completes the sale.

You could take several approaches to verify that the person presenting the pass is actually the account holder. A store card can include a thumbnail image, so you could put the account holder’s picture on the pass. For greater security, you could store the account holder’s picture in your database and display it on the cashier’s screen rather than trusting the pass. Other approaches are also possible, such as asking for a photo ID.

At some point after the sale, your server pushes an update to the pass with the new balance. This lets your users easily check their balance as it’s displayed right on the pass. This update can be handled by a different server that implements the web service API.

### Pass for a Season Membership
Suppose you work for a museum that supports Passbook for its annual memberships. You want to let your members use the same pass for the entire year, with occasional updates to keep information about traveling exhibits current.

Ideally, the pass needs a unique ID in the barcode that you can scan at the museum entrance, to verify with your server that the membership is still valid. However, this is an situation where it’s possible to establish trust without consulting your server. (For example, if your scanners don’t have a network connection.) In addition to the unique ID in the barcode, you now include the year that the pass is valid, followed by a cryptographic signature of the ID and year. The signature lets you check that the contents of the barcode came from your server, and is therefore trustworthy.

This approach would not let you implement a one-time-use coupon without network access at the scanner; that’s essentially an unsolvable problem. It works here because the barcode contains an unchanging fact—a year that the membership is valid—and that is the only piece of information needed to determine whether the pass is still valid. Scanning the museum pass doesn’t change any state. In contrast, scanning a one-time-use coupon does change state: it voids the coupon. Without network access at the scanner, there is no way to get the latest state of the world before scanning or inform others of a state change after scanning.







## Release History
_(Nothing yet)_









