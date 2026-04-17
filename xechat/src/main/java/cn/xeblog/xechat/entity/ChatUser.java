package cn.xeblog.xechat.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("chat_user")
public class ChatUser {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String email;    // 登录用 email

    @TableField(select = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String nickname; // 展示用 nickname
    private String avatar;
    private String signature;
    private String tags;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE) // 必须确保 DB 中有 update_time 字段
    private LocalDateTime updateTime;
}