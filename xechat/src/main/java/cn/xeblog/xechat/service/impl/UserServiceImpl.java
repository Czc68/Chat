package cn.xeblog.xechat.service.impl;

import cn.xeblog.xechat.entity.ChatUser;
import cn.xeblog.xechat.mapper.ChatUserMapper;
import cn.xeblog.xechat.service.IUserService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<ChatUserMapper, ChatUser> implements IUserService {

    @Override
    public ChatUser login(String username, String password) {
        // 使用 LambdaQueryWrapper 避免硬编码字段名
        return this.getOne(new LambdaQueryWrapper<ChatUser>()
                .eq(ChatUser::getEmail, username)
                .eq(ChatUser::getPassword, password));
    }

    @Override
    public boolean register(ChatUser user) {
        // 1. 检查用户名是否存在
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
    /**
     * 实现检查邮箱是否存在的逻辑
     */
    @Override
    public boolean checkEmailExists(String email) {
        // 借助 MyBatis-Plus 的 QueryWrapper 直接查询数据库
        QueryWrapper<ChatUser> queryWrapper = new QueryWrapper<>();
        // 相当于生成 SQL: SELECT count(*) FROM chat_user WHERE email = ?
        queryWrapper.eq("email", email);

        // 如果查出来的数量大于 0，说明邮箱已被注册，返回 true
        return this.count(queryWrapper) > 0;
    }
}