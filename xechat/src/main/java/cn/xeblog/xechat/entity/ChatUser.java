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
    private String username;
    @TableField(select = false)
    @JsonProperty(access =  JsonProperty.Access.WRITE_ONLY)// 仅允许写入（注册），禁止输出（登录返回）
    private String password;
    private String nickname;
    private String avatar;
    private String signature;

    /** 用户画像标签 */
    private String tags;

    // 自动填充：插入时填充
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    // 自动填充：插入和更新时均填充
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}
