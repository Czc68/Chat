package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.entity.ChatUser;
import cn.xeblog.xechat.service.IUserService;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Resource
    private IUserService userService;

    @PostMapping("/login")
    public ResponseVO login(@RequestBody ChatUser loginInfo, HttpSession session) {
        // 1. 简单校验前端传来的参数
        if (loginInfo.getEmail() == null || loginInfo.getPassword() == null) {
            return ResponseVO.error("邮箱或密码不能为空");
        }

        // 2. 调用 service 进行登录验证
        ChatUser user = userService.login(loginInfo.getEmail(), loginInfo.getPassword());

        if (user != null) {
            // 3. 登录成功，存入 session
            session.setAttribute("user", user);

            // 极其不建议把密码原样返回给前端！最好在返回前把密码置空
            user.setPassword(null);

            // 返回包含用户数据的成功响应
            return ResponseVO.success(user);
        }

        // 4. 登录失败
        return ResponseVO.error("邮箱或密码错误");
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