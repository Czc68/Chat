-- 1. 创建数据库
CREATE
DATABASE IF NOT EXISTS xechat CHARACTER SET utf8mb4;
USE
xechat;

-- 2. 创建用户表（画像核心：tags 字段）
CREATE TABLE `chat_user`
(
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username`    VARCHAR(50)  NOT NULL UNIQUE COMMENT '登录账号',
    `password`    VARCHAR(100) NOT NULL COMMENT 'BCrypt加密密码',
    `nickname`    VARCHAR(50)  NOT NULL COMMENT '昵称',
    `avatar`      VARCHAR(255) DEFAULT 'https://api.multiavatar.com/default.png' COMMENT '头像',
    `signature`   VARCHAR(200) COMMENT '个性签名',
    `tags`        VARCHAR(255) COMMENT '画像标签(如: Java, 软件工程, 聊大校友)',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 创建聊天记录表
CREATE TABLE `chat_history`
(
    `id`          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id`     BIGINT NOT NULL COMMENT '关联 chat_user.id',
    `content`     TEXT   NOT NULL COMMENT '消息内容',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;