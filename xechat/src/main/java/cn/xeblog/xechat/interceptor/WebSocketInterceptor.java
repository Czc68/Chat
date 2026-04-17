package cn.xeblog.xechat.interceptor;

import cn.xeblog.xechat.constant.UserStatusConstant;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.utils.SensitiveWordUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;

import java.util.Map;

@Component
@Slf4j
public class WebSocketInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(stompHeaderAccessor.getCommand())) {
            User user = new User();

            // 💥 修复1：抛弃不稳定的 Session，直接从前端 STOMP Header 里读取真实的数据库 ID
            String userId = stompHeaderAccessor.getFirstNativeHeader("userId");
            if (StringUtils.isNotBlank(userId) && !userId.equals("undefined")) {
                user.setUserId(userId);
            } else {
                user.setUserId("999999"); // 兜底：给个纯数字，防止存入数据库时 bigint 报错
            }

            user.setUsername(SensitiveWordUtils.loveChina(stompHeaderAccessor.getFirstNativeHeader("username")));
            user.setAvatar(stompHeaderAccessor.getFirstNativeHeader("avatar"));
            user.setAddress(stompHeaderAccessor.getFirstNativeHeader("address"));
            user.setStatus(UserStatusConstant.ONLINE);

            stompHeaderAccessor.setUser(user);
            log.info("WebSocket 绑定用户身份成功 -> ID: {}, 昵称: {}", user.getUserId(), user.getUsername());
        }
        return message;
    }

    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // 💥 修复2：直接放行。因为跨域时经常掉 Cookie，我们已在上面通过 Header 绑定了身份
        return true;
    }
}