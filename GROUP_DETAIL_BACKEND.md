# Group Detail Feature — Backend Instructions

## Context

Adding a Group Detail view to what2play. The frontend needs a new endpoint to update group metadata (rename, add/remove members). Everything else the frontend needs already exists.

## Existing Relevant Endpoints

- `GET /w2p/groups/{id}` — already exists, returns group with members array
- `GET /w2p/friends/games?user_id={id}` — already exists, returns a user's games (used for friend comparison)
- `DELETE /w2p/groups/{id}` — already exists

## New Endpoint Required

### `PATCH /w2p/groups/{group_id}`

Allows the group owner to update a group's name and/or member list.

**Auth**: Bearer token required. Only the group owner should be able to update.

**Request body** (all fields optional, send only what's changing):
```json
{
  "group_name": "New Group Name",
  "members": [
    { "user_id": "abc-123", "username": "Dusk" },
    { "user_id": "def-456", "username": "DuskTest" }
  ]
}
```

**Behavior**:
- Validate caller is the group owner (`owner_id` on the group record). Return 403 if not.
- If `group_name` provided: update it. Validate non-empty string.
- If `members` provided: replace the members array entirely. The owner should always remain in the members list — enforce this server-side.
- Members must be from the caller's friends list. Validate this to prevent arbitrary user_ids being added.
- Return the updated group object on success (same shape as `GET /w2p/groups/{id}`).

**Response** (200):
```json
{
  "group_id": "74719136-...",
  "group_name": "Updated Name",
  "owner_id": "58c16320-...",
  "members": [...],
  "created_date": "...",
  "pick_history": [...]
}
```

**Errors**:
- `403` — caller is not the group owner
- `404` — group not found
- `400` — invalid body (empty name, owner removed from members, etc.)

## Notes

- The frontend will send the full updated members array (not a diff), so the handler just replaces `members` on the record.
- Pick history should be preserved on update — do not clear it.
- The existing `getGroupById` helper can be reused for the ownership check.
- Two-way friendships and group membership consent are a planned future feature. For now, one-way is intentional and accepted.
