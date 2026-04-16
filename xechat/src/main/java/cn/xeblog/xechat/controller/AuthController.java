package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.entity.ChatUser;
import cn.xeblog.xechat.service.IUserService;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Resource
    private IUserService userService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody ChatUser loginInfo, HttpSession session) {
        ChatUser user = userService.login(loginInfo.getEmail(), loginInfo.getPassword());
        if (user != null) {
            session.setAttribute("user", user);
            return Map.of("code", 200, "msg", "登录成功", "data", user);
        }
        return Map.of("code", 400, "msg", "用户名或密码错误");
    }

    @PostMapping("/register")
    public ResponseVO register(@RequestBody ChatUser chatUser) {
        // 检查 email 是否为空
        if (StringUtils.isEmpty(chatUser.getEmail())) {
            return ResponseVO.error("邮箱不能为空");
        }

        // 调用 service 检查邮箱是否存在
        if (userService.checkEmailExists(chatUser.getEmail())) {
            return ResponseVO.error("该邮箱已被注册");
        }

        // ... 保存逻辑
        return userService.save(chatUser) ? ResponseVO.success() : ResponseVO.error("注册失败");
    }
}