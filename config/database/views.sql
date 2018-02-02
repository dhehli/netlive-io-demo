CREATE VIEW v_user AS SELECT * FROM user WHERE deleted = 0;

CREATE VIEW v_onlinestate AS SELECT * FROM user WHERE deleted = 0;

CREATE VIEW v_userpermission AS SELECT * FROM user WHERE deleted = 0;

CREATE VIEW v_userstate AS SELECT * FROM user WHERE deleted = 0;
