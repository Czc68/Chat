package cn.xeblog.xechat.service;

import cn.xeblog.xechat.entity.ChatUser;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IUserService extends IService<ChatUser> {
    // 登录验证
    ChatUser login(String email, String password);

    // 注册逻辑（含画像初始化）
    boolean register(ChatUser user);

    // 【新增这行】检查邮箱是否存在
    boolean checkEmailExists(String email);
}