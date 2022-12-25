USE skillprofile;

CREATE TABLE Accounts(
    username VARCHAR(64) PRIMARY KEY,
    userrole VARCHAR(64),
    passwordHash VARCHAR(256),
    firstname VARCHAR(64),
    surname VARCHAR(64),  
    birthday DATE
);

CREATE TABLE Profiles(
    profileID int PRIMARY KEY AUTO_INCREMENT,
    job VARCHAR(32),
    company VARCHAR(32),
    nationality VARCHAR (32),
    email VARCHAR (32),
    phone VARCHAR (32),
    city VARCHAR (64),
    username VARCHAR(32) NOT NULL,
    FOREIGN KEY (username) REFERENCES Accounts(username) ON DELETE CASCADE
);


CREATE TABLE SkillCategorys(
    categoryID int PRIMARY KEY AUTO_INCREMENT,
    categoryName VARCHAR(64)
);

CREATE TABLE Skills(
    skillID int PRIMARY KEY AUTO_INCREMENT,
    skillname VARCHAR(64),
    featured boolean
);

CREATE TABLE KeyStrengths(
    keyStrengthID int PRIMARY KEY AUTO_INCREMENT,
    profileID int NOT NULL,
    keyStrengthsInfo VARCHAR(512),
    FOREIGN KEY (profileID) REFERENCES Profiles(profileID) ON DELETE CASCADE
);


CREATE TABLE Projects(
    projectID int PRIMARY KEY AUTO_INCREMENT,
    profileID int NOT NULL,
    projectName VARCHAR(64),
    projectInfo VARCHAR(2048),
    projectStart DATE,
    projectEnd DATE,
    FOREIGN KEY (profileID) REFERENCES Profiles(profileID) ON DELETE CASCADE
);

CREATE TABLE Qualifications(
    qualificationID int PRIMARY KEY AUTO_INCREMENT,
    profileID int NOT NULL,
    qualificationInfo VARCHAR(1024),
    qualificationStart DATE,
    qualificationEnd DATE,
    qualificationPlace VARCHAR(32),
    FOREIGN KEY (profileID) REFERENCES Profiles(profileID) ON DELETE CASCADE
);

CREATE TABLE ProfileSkills(
    profileSkillsID int PRIMARY KEY AUTO_INCREMENT,
    skillID int,
    profileID int NOT NULL,
    rating int,
    FOREIGN KEY (profileID) REFERENCES Profiles(profileID)  ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills (skillID) ON DELETE CASCADE
);