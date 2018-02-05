CREATE OR REPLACE VIEW v_user AS SELECT * FROM user WHERE deleted = 0;

CREATE OR REPLACE VIEW v_onlinestate AS SELECT * FROM user WHERE deleted = 0;

CREATE OR REPLACE VIEW v_userpermission AS SELECT * FROM user WHERE deleted = 0;

CREATE OR REPLACE VIEW v_userstate AS SELECT * FROM user WHERE deleted = 0;

CREATE OR REPLACE VIEW v_user_forgotpassword AS SELECT * FROM user_forgotpassword WHERE deleted = 0;
