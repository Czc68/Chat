package cn.xeblog.xechat.service.impl;

import cn.xeblog.xechat.entity.ChatUser;
import cn.xeblog.xechat.mapper.ChatUserMapper;
import cn.xeblog.xechat.service.IUserService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<ChatUserMapper, ChatUser> implements IUserService {

    @Override
    public ChatUser login(String email, String password) {
        // 逻辑对齐：根据 email 字段查询用户
        return this.getOne(new LambdaQueryWrapper<ChatUser>()
                .eq(ChatUser::getEmail, email)
                .eq(ChatUser::getPassword, password));
    }

    @Override
    public boolean register(ChatUser user) {
        // 1. 检查用户名是否存在
        //注册查重逻辑也要改为 email
        long count = this.count(new LambdaQueryWrapper<ChatUser>()
                .eq(ChatUser::getEmail, user.getEmail()));
        if (count > 0) return false;

        // 2. 初始化用户画像标签（如果没有传入）
        if (user.getTags() == null || user.getTags().isEmpty()) {
            user.setTags("新用户,技术爱好者");
        }

        // 3. 执行保存（MyBatisPlusHandler 会自动填充时间）
        return this.save(user);
    }
}