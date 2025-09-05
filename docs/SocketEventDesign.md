## Socket Events Design

### Introduction & Scope

This document defines the real-time event contract for the backend system, supporting features such as messaging, notifications, friend management, group chat, and audio/video calls. It specifies the socket events exchanged between clients and the server using WebSocket (Socket.io), including event names, emitters, receivers, payload structures, and descriptions. <br>

The scope of this design covers all event-driven and real-time features that require immediate updates for users, such as sending and receiving messages, live notifications, call invitations, and group actions. These events complement the RESTful API by providing instantaneous feedback and updates whenever relevant backend actions occur, ensuring a responsive and interactive user experience. <br>

Socket events are structured to support both one-to-one and group interactions, enabling scalable and maintainable real-time communication between users. All payloads are in JSON format. This specification serves as a reference for both frontend and backend developers to implement and consume socket-based features consistently. <br>

---

### Event List

#### Friend Requests

| Event Name                | Emitter | Receiver | Payload                                                          | Description                 |
| ------------------------- | ------- | -------- | ---------------------------------------------------------------- | --------------------------- |
| `send_friend_request`     | Client  | Server   | `{ senderId: string, receiverId: string, friendRequest: object}` | Send friend request         |
| `new_friend_request`      | Server  | Client   | `{ friendRequest: object, senderId: string }`                    | Notify new friend request   |
| `accept_friend_request`   | Client  | Server   | `{ acceptedBy: string, requestSender: string }`                  | Accept friend request       |
| `friend_request_accepted` | Server  | Client   | `{ friend: object  }`                                            | Result of accepting request |

---

#### 1-to-1 and Group Messaging

| Event Name       | Emitter | Receiver | Payload                | Description               |
| ---------------- | ------- | -------- | ---------------------- | ------------------------- |
| send_message     | Client  | Server   | { chatId, messageId }  | Send message in chat      |
| message_sent     | Server  | Client   | { success, message }   | Result of sending message |
| message_received | Server  | Client   | { chatId, messageId }  | Receive messages in chat  |
| edit_message     | Client  | Server   | { messageId, content } | Edit a message            |
| message_edited   | Server  | Client   | { success, message }   | Message edit result       |
| delete_message   | Client  | Server   | { messageId }          | Delete a message          |
| message_deleted  | Server  | Client   | { success, messageId } | Message deletion result   |
| read_message     | Client  | Server   | { chatId, messageId }  | Read message in chat      |
| message_read     | Server  | Client   | { success, message }   | Result of read message    |

---

#### Group Chat Actions

| Event Name            | Emitter | Receiver | Payload                            | Description                |
| --------------------- | ------- | -------- | ---------------------------------- | -------------------------- |
| send_group_invite     | Client  | Server   | { groupId, userIds }               | Invite members to group    |
| group_invite_sent     | Server  | Client   | { success, invitedUsers, message } | Result of invitations      |
| accept_group_invite   | Client  | Server   | { groupId }                        | Accept group invitation    |
| group_invite_accepted | Server  | Client   | { success, group, message }        | Result of accepting invite |
| reject_group_invite   | Client  | Server   | { groupId }                        | Reject group invitation    |
| group_invite_rejected | Server  | Client   | { success, message }               | Result of rejecting invite |
| leave_group           | Client  | Server   | { groupId }                        | Leave group                |
| group_left            | Server  | Client   | { success, message }               | Result of leaving group    |
| remove_group_member   | Client  | Server   | { groupId, userId }                | Remove member              |
| group_member_removed  | Server  | Client   | { success, message }               | Result of removal          |

---

#### Audio/Video Calls

| Event Name         | Emitter | Receiver | Payload                  | Description                  |
| ------------------ | ------- | -------- | ------------------------ | ---------------------------- |
| start_audio_call   | Client  | Server   | { friendUserId }         | Start audio call with friend |
| audio_call_started | Server  | Client   | { success, callInfo }    | Audio call started           |
| start_video_call   | Client  | Server   | { friendUserId }         | Start video call with friend |
| end_audio_call     | Client  | Server   | { audioCallId }          | End an ongoing audio call    |
| audio_call_ended   | Server  | Client   | { success, audioCallId } | Audio call ended             |
| end_video_call     | Client  | Server   | { videoCallId }          | End an ongoing video call    |
| video_call_ended   | Server  | Client   | { success, videoCallId } | Video call ended             |

---

#### Realtime Notifications

| Event Name           | Emitter | Receiver | Payload                                                | Description                                                                  |
| -------------------- | ------- | -------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| new_notification     | Server  | Client   | { fromUserId, message, timestamp, groupId, eventType } | Notify users with friend request sent, group invite, friend request accepted |
| new_message_received | Server  | Client   | {messageId, chatId}                                    | Nofity users with new message in chat                                        |
| new_call_invite      | Server  | Client   | {callId, chatId}                                       | Nofity users with new calls in chat                                          |

---

**Notes:**

- All event payloads are JSON objects.
- "Result" events are sent as feedback after processing the initial request.
- Additional events can be added for error handling, broadcasting updates, or real-time synchronization as needed.
