package cn.xeblog.xechat.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("chat_history")
public class ChatHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;      // 对应 chat_user.id
    private String content;    // 消息内容
    private LocalDateTime createTime;
}

