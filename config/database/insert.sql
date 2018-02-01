USE netliveio;

INSERT INTO onlinestate(onlinestate_id, onlinestate) VALUES
	(null, "Online"),
    (null, "Offline")
;

INSERT INTO userpermission(userpermission_id, userpermission, onlinestate_id) VALUES
	(null, "member", 1),
    (null, "admin", 1),
    (null, "superadmin", 1)
;

INSERT INTO userstate(userstate_id, userstate, onlinestate_id) VALUES
	(null, "access",1),
    (null, "blocked", 1)
;
