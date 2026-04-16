package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.entity.ChatUser;
import cn.xeblog.xechat.service.IUserService;
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
        ChatUser user = userService.login(loginInfo.getUsername(), loginInfo.getPassword());
        if (user != null) {
            session.setAttribute("user", user);
            return Map.of("code", 200, "msg", "登录成功", "data", user);
        }
        return Map.of("code", 400, "msg", "用户名或密码错误");
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody ChatUser user) {
        if (userService.register(user)) {
            return Map.of("code", 200, "msg", "注册成功");
        }
        return Map.of("code", 400, "msg", "注册失败，用户名可能已存在");
    }
}