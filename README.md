# Documentation

## Schema

### Connect Request
* sender => UID of request sender user
* recipient => UID of user for whom the request is sending
* time => This field stores When the requst is generated / when the request is accepted / expired / rejected
* status => This field is to know that the filed is pending, accepted, rejected, expired.

### Chat
* participants => [Messager sending user UID, Messanger receiver user UID]
* messages => message body
* status => enum['ACTIVE', 'EXPIRED']

### Booking => Users can book date/get-together based on their locality via application
* cafeId => Date Intiator/Organiser UID
* _id => Invitee UID
* address => venue of the cafe
* starttime => start time of event/date
* endtime => end time of event/date
* status => enum['ACTIVE', 'INACTIVE']


## API Logic
### connect Request
* Postman collection attached consists of create Connection request, accept/decline pending requests, get proposals and requests of the user
* When a connection request is initiated It will wait for 24 hours and if the status is still pending then it will change it as expired
* When a connection request is Accepted it will expire it after 24 hours of acceptance

### Chat
* There are 3 simple Api's to create chat, to get all chat of a User and to get all chat of a user with a perticular id
* User will be not able to send chat if the connection between the user is expired
* But they can access their previous chats

### Booking
* 3 api's with Create , get bookings and cancel bookings or undoing the cancel.
* user can only book if their connection is active.


## CRON JOB
* In order to check the status of a connection and to expire it after 24 hours whenever a getInvitationRequest or sending message for chat is executed it updates the all Invitaion or chatActiveSession based on their expire time instead of using any nodeJs sheduler for cron jobs. You can use nodejs sheduler also for your own preferences.
* This will check for the status ("PENDING" or "ACCEPTED") and the time (is more then 24 hours) then it will change the status to "EXPIRED".
