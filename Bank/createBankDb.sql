CREATE TABLE [account](
    [Id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [BankUserId] INTEGER NOT NULL,
    [AccountNo] INTEGER NOT NULL,
    [IsStudent] INTEGER NOT NULL,
    [CreatedAt] DATE NOT NULL,
    [ModifiedAt] DATE NOT NULL,
    [InterestRate] DOUBLE NOT NULL,
    [Amount] FLOAT NOT NULL
    
);

CREATE TABLE [bankuser](
    [Id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [UserId] INTEGER NOT NULL,
    [CreatedAt] DATE NOT NULL,
    [ModifiedAt] DATE NOT NULL,
    FOREIGN KEY ([UserId]) REFERENCES [loan](BankUserId),
    FOREIGN KEY ([UserId]) REFERENCES [deposit](BankUserId),
    FOREIGN KEY ([UserId]) REFERENCES [account](BankUserId)
);

CREATE TABLE [deposit](
    [Id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [BankUserId] INTEGER NOT NULL,
    [CreatedAt] DATE NOT NULL,
    [Amount] INTEGER NOT NULL
);

CREATE TABLE [loan](
    [Id] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    [BankUserId] INTEGER NOT NULL,
    [CreatedAt] DATE NOT NULL,
    [ModifiedAt] DATE NOT NULL,
    [Amount] INTEGER NOT NULL
);