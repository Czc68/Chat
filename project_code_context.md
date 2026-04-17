# 项目代码汇总

> 根目录: .

## 文件: xechat\.mvn\wrapper\MavenWrapperDownloader.java
```java
/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.Properties;

public class MavenWrapperDownloader {

    /**
     * Default URL to download the maven-wrapper.jar from, if no 'downloadUrl' is provided.
     */
    private static final String DEFAULT_DOWNLOAD_URL =
            "https://repo.maven.apache.org/maven2/io/takari/maven-wrapper/0.4.2/maven-wrapper-0.4.2.jar";

    /**
     * Path to the maven-wrapper.properties file, which might contain a downloadUrl property to
     * use instead of the default one.
     */
    private static final String MAVEN_WRAPPER_PROPERTIES_PATH =
            ".mvn/wrapper/maven-wrapper.properties";

    /**
     * Path where the maven-wrapper.jar will be saved to.
     */
    private static final String MAVEN_WRAPPER_JAR_PATH =
            ".mvn/wrapper/maven-wrapper.jar";

    /**
     * Name of the property which should be used to override the default download url for the wrapper.
     */
    private static final String PROPERTY_NAME_WRAPPER_URL = "wrapperUrl";

    public static void main(String args[]) {
        System.out.println("- Downloader started");
        File baseDirectory = new File(args[0]);
        System.out.println("- Using base directory: " + baseDirectory.getAbsolutePath());

        // If the maven-wrapper.properties exists, read it and check if it contains a custom
        // wrapperUrl parameter.
        File mavenWrapperPropertyFile = new File(baseDirectory, MAVEN_WRAPPER_PROPERTIES_PATH);
        String url = DEFAULT_DOWNLOAD_URL;
        if (mavenWrapperPropertyFile.exists()) {
            FileInputStream mavenWrapperPropertyFileInputStream = null;
            try {
                mavenWrapperPropertyFileInputStream = new FileInputStream(mavenWrapperPropertyFile);
                Properties mavenWrapperProperties = new Properties();
                mavenWrapperProperties.load(mavenWrapperPropertyFileInputStream);
                url = mavenWrapperProperties.getProperty(PROPERTY_NAME_WRAPPER_URL, url);
            } catch (IOException e) {
                System.out.println("- ERROR loading '" + MAVEN_WRAPPER_PROPERTIES_PATH + "'");
            } finally {
                try {
                    if (mavenWrapperPropertyFileInputStream != null) {
                        mavenWrapperPropertyFileInputStream.close();
                    }
                } catch (IOException e) {
                    // Ignore ...
                }
            }
        }
        System.out.println("- Downloading from: : " + url);

        File outputFile = new File(baseDirectory.getAbsolutePath(), MAVEN_WRAPPER_JAR_PATH);
        if (!outputFile.getParentFile().exists()) {
            if (!outputFile.getParentFile().mkdirs()) {
                System.out.println(
                        "- ERROR creating output direcrory '" + outputFile.getParentFile().getAbsolutePath() + "'");
            }
        }
        System.out.println("- Downloading to: " + outputFile.getAbsolutePath());
        try {
            downloadFileFromURL(url, outputFile);
            System.out.println("Done");
            System.exit(0);
        } catch (Throwable e) {
            System.out.println("- Error downloading");
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void downloadFileFromURL(String urlString, File destination) throws Exception {
        URL website = new URL(urlString);
        ReadableByteChannel rbc;
        rbc = Channels.newChannel(website.openStream());
        FileOutputStream fos = new FileOutputStream(destination);
        fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
        fos.close();
        rbc.close();
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\package-info.java
```java
package cn.xeblog.xechat;
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\XechatApplication.java
```java
package cn.xeblog.xechat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class XechatApplication {

    public static void main(String[] args) {
        SpringApplication.run(XechatApplication.class, args);
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\annotation\ChatRecord.java
```java
package cn.xeblog.xechat.annotation;

import java.lang.annotation.*;

/**
 * 聊天记录注解
 * <p>
 * 加上这个注解的特定方法，会将聊天记录信息记录到文件中。
 * 特定方法是指方法必需以MessageVO类或该类的子类作为参数，
 * 如果有多个MessageVO类或该类的子类作为参数，则默认取第一个
 *
 * @author yanpanyi
 * @date 2019/4/23
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ChatRecord {
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\aop\ChatRecordAspect.java
```java
package cn.xeblog.xechat.aop;

import cn.xeblog.xechat.domain.dto.ChatRecordDTO;
import cn.xeblog.xechat.domain.vo.MessageVO;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import cn.xeblog.xechat.service.ChatRecordService;
import cn.xeblog.xechat.utils.SensitiveWordUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import jakarta.annotation.Resource;

/**
 * 聊天记录切面类
 *
 * @author yanpanyi
 * @date 2019/4/23
 */
@Aspect
@Component
@Slf4j
public class ChatRecordAspect {

    @Resource
    private ChatRecordService chatRecordService;

    @Pointcut("@annotation(cn.xeblog.xechat.annotation.ChatRecord)")
    public void chatRecordPointcut() {
    }

    @Before("chatRecordPointcut()")
    public void doBefore(JoinPoint joinPoint) {
        log.debug("before -> {}", joinPoint);

        MessageVO messageVO = null;
        Object[] args = joinPoint.getArgs();
        for (Object obj : args) {
            if (obj instanceof MessageVO) {
                messageVO = (MessageVO) obj;
                break;
            }
        }

        Assert.notNull(messageVO, "方法必需以MessageVO类或该类的子类作为参数");

        if (messageVO.getType() == MessageTypeEnum.USER) {
            // 对于User类型的消息做敏感词处理
            messageVO.setMessage(SensitiveWordUtils.loveChina(messageVO.getMessage()));
        }

        log.debug("添加聊天记录 -> {}", messageVO);
        chatRecordService.addRecord(ChatRecordDTO.toChatRecordDTO(messageVO));
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\cache\UserCache.java
```java
package cn.xeblog.xechat.cache;

import cn.xeblog.xechat.constant.RobotConstant;
import cn.xeblog.xechat.constant.UserStatusConstant;
import cn.xeblog.xechat.domain.mo.User;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 缓存用户信息
 *
 * @author yanpanyi
 * @date 2019/3/24
 */
public class UserCache {

    /**
     * 在线用户列表
     */
    private final static ConcurrentHashMap<String, User> USER_MAP = new ConcurrentHashMap<>(32);

    static {
        // 初始化机器人信息
        String uid = RobotConstant.key;
        User user = new User();
        user.setUserId(uid);
        user.setUsername(RobotConstant.name);
        user.setAvatar(RobotConstant.avatar);
        user.setAddress(RobotConstant.address);
        user.setStatus(UserStatusConstant.ONLINE);

        // 将机器人加入到用户列表
        USER_MAP.put(uid, user);
    }

    /**
     * 添加用户
     *
     * @param key 存储的键
     * @param user 存储的user对象
     */
    public static void addUser(String key, User user) {
        if (USER_MAP.containsKey(key)) {
            return;
        }

        USER_MAP.put(key, user);
    }

    /**
     * 获取用户
     *
     * @param key 存储的键
     * @return user对象
     */
    public static User getUser(String key) {
        return USER_MAP.get(key);
    }

    /**
     * 删除用户
     *
     * @param key 存储的键
     */
    public static void removeUser(String key) {
        USER_MAP.remove(key);
    }

    /**
     * 获取在线用户数
     *
     * @return 在线人数
     */
    public static int getOnlineCount() {
        return USER_MAP.size();
    }

    /**
     * 获取所有的在线用户
     *
     * @return 在线人数列表
     */
    public static List<User> listUser() {
        return new ArrayList<>(USER_MAP.values());
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\config\CorsConfig.java
```java
package cn.xeblog.xechat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 拦截所有请求
                .allowedOrigins("http://localhost:5173") // 允许前端 Vite 端口
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true); // 允许携带 Cookie (用于 Session)
    }
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\config\FileConfig.java
```java
package cn.xeblog.xechat.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 文件相关
 *
 * @author yanpanyi
 * @date 2019/03/27
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "file")
public class FileConfig {

    /**
     * 上传文件路径
     */
    private String uploadPath;
    /**
     * 静态资源访问路径
     */
    private String staticAccessPath;
    /**
     * 文件目录映射
     */
    private String directoryMapping;
    /**
     * 访问地址
     */
    private String accessAddress;

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\config\MyBatisPlusHandler.java
```java
package cn.xeblog.xechat.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class MyBatisPlusHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\config\RestTemplateConfig.java
```java
package cn.xeblog.xechat.config;

import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.core5.http.io.SocketConfig;
import org.apache.hc.core5.pool.PoolConcurrencyPolicy;
import org.apache.hc.core5.pool.PoolReusePolicy;
import org.apache.hc.core5.util.Timeout;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

/**
 * restTemplate配置
 *
 * @author yanpanyi
 * @date 2019/4/9
 **/
@Configuration
public class RestTemplateConfig {

    /**
     * 总连接数
     */
    @Value("${restTemplate.threadSize}")
    private int poolSize;

    /**
     * 连接不够时的等待时间，单位ms
     */
    @Value("${restTemplate.waitingTime}")
    private int waitingTime;

    /**
     * 连接超时时间，单位ms
     */
    @Value("${restTemplate.connectTimeOut}")
    private int connectTimeOut;

    /**
     * 读取超时时间，单位ms
     */
    @Value("${restTemplate.readTimeOut}")
    private int readTimeOut;

    @Bean(name = "restTemplate")
    public RestTemplate restTemplate() {
        // 连接配置
        ConnectionConfig connectionConfig = ConnectionConfig.custom()
                .setConnectTimeout(Timeout.of(connectTimeOut, TimeUnit.MILLISECONDS))
                .setSocketTimeout(Timeout.of(readTimeOut, TimeUnit.MILLISECONDS))
                .build();

        // 请求配置
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(Timeout.of(waitingTime, TimeUnit.MILLISECONDS))
                .setResponseTimeout(Timeout.of(readTimeOut, TimeUnit.MILLISECONDS))
                .build();

        // Socket配置
        SocketConfig socketConfig = SocketConfig.custom()
                .setSoTimeout(Timeout.of(readTimeOut, TimeUnit.MILLISECONDS))
                .build();

        // 连接池管理器
        PoolingHttpClientConnectionManager connMgr = PoolingHttpClientConnectionManagerBuilder.create()
                .setDefaultConnectionConfig(connectionConfig)
                .setDefaultSocketConfig(socketConfig)
                .setMaxConnTotal(poolSize + 1)
                .setMaxConnPerRoute(poolSize)
                .setPoolConcurrencyPolicy(PoolConcurrencyPolicy.STRICT)
                .setConnPoolPolicy(PoolReusePolicy.LIFO)
                .build();

        CloseableHttpClient httpClient = HttpClients.custom()
                .setConnectionManager(connMgr)
                .setDefaultRequestConfig(requestConfig)
                .build();

        // httpClient连接配置
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        clientHttpRequestFactory.setHttpClient(httpClient);
        // 缓冲请求数据，默认值是true。通过POST或者PUT大量发送数据时，建议将此属性更改为false，以免耗尽内存。
        clientHttpRequestFactory.setBufferRequestBody(false);

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(clientHttpRequestFactory);

        MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter = new MappingJackson2HttpMessageConverter();
        mappingJackson2HttpMessageConverter.setSupportedMediaTypes(Arrays.asList(MediaType.APPLICATION_JSON,
                MediaType.APPLICATION_OCTET_STREAM, MediaType.TEXT_PLAIN));
        restTemplate.getMessageConverters().add(mappingJackson2HttpMessageConverter);

        return restTemplate;
    }
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\config\WebMvcConfig.java
```java
package cn.xeblog.xechat.config;

import cn.xeblog.xechat.interceptor.PermissionInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.Resource;

/**
 * mvc配置
 *
 * @author yanpanyi
 * @date 2019/03/27
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Resource
    private FileConfig fileConfig;
    @Resource
    private PermissionInterceptor permissionInterceptor;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(fileConfig.getStaticAccessPath())
                .addResourceLocations("classpath:/META-INF/resources/", "classpath:/resources/", "classpath:/static/",
                        "file:" + fileConfig.getDirectoryMapping());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(permissionInterceptor).addPathPatterns("/api/record/**", "/chatrecord/**");
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\config\WebSocketConfig.java
```java
package cn.xeblog.xechat.config;

import cn.xeblog.xechat.constant.StompConstant;
import cn.xeblog.xechat.interceptor.WebSocketInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import jakarta.annotation.Resource;

/**
 * websocket配置
 *
 * @author yanpanyi
 * @EnableWebSocketMessageBroker 注解开启使用STOMP协议来传输基于MessageBroker代理的消息
 * @date 2019/3/20
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Resource
    private WebSocketInterceptor webSocketInterceptor;

    /**
     * 配置消息代理
     *
     * @param registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 广播式使用/topic，点对点式使用/user
        registry.enableSimpleBroker(StompConstant.STOMP_TOPIC, StompConstant.STOMP_USER);
    }

    /**
     * 注册STOMP的节点，并映射指定的url
     *
     * @param registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册STOMP的endpoint，并指定使用SockJS协议
        registry.addEndpoint(StompConstant.STOMP_ENDPOINT).withSockJS();
    }

    /**
     * 注册消息拦截器
     *
     * @param registration
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketInterceptor);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\constant\DateConstant.java
```java
package cn.xeblog.xechat.constant;

/**
 * 日期相关常量
 *
 * @author yanpanyi
 * @date 2019/3/25
 */
public interface DateConstant {

    /**
     * 发送消息时间格式
     */
    String SEND_TIME_FORMAT = "yyyy/MM/dd HH:mm";

    /**
     * 聊天记录文件名为指定时间格式的字符
     */
    String CHAT_RECORD_FILE_NAME = "yyyyMMdd";

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\constant\MessageConstant.java
```java
package cn.xeblog.xechat.constant;

/**
 * 消息模板
 *
 * @author anlingyi
 * @date 2019/5/7
 */
public interface MessageConstant {
    /**
     * 进入聊天室广播消息
     */
    String ONLINE_MESSAGE = "%s进入了聊天室";
    /**
     * 离开聊天室广播消息
     */
    String OFFLINE_MESSAGE = "%s离开了聊天室";
    /**
     * 机器人欢迎消息
     */
    String ROBOT_WELCOME_MESSAGE = "@%s 欢迎来到聊天室！消息内容以'#'开头的我就能收到哦（PS：双击我的头像与我聊天），" +
            "随时来撩我呀！";
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\constant\RobotConstant.java
```java
package cn.xeblog.xechat.constant;

/**
 * 机器人相关常量
 *
 * @author yanpanyi
 * @date 2019/4/10
 */
public interface RobotConstant {
    /**
     * 存储的key
     */
    String key = "robot";
    /**
     * 触发机器人聊天的消息前缀
     */
    String prefix = "#";
    /**
     * 机器人名称
     */
    String name = "小小毅";
    /**
     * 机器人头像
     */
    String avatar = "./images/avatar/robot.jpeg";
    /**
     * 机器人地理位置
     */
    String address = "火星";
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\constant\StompConstant.java
```java
package cn.xeblog.xechat.constant;

/**
 * stomp相关常量
 *
 * @author yanpanyi
 * @date 2019/3/22
 */
public interface StompConstant {
    /**
     * STOMP的节点
     */
    String STOMP_ENDPOINT = "/xechat";
    /**
     * 广播式
     */
    String STOMP_TOPIC = "/topic";
    /**
     * 一对一式
     */
    String STOMP_USER = "/user";
    /**
     * 单用户消息订阅地址
     */
    String SUB_USER = "/chat";
    /**
     * 单用户消息发布地址
     */
    String PUB_USER = "/chat";
    /**
     * 聊天室消息发布地址
     */
    String PUB_CHAT_ROOM = "/chatRoom";

    /**
     * 聊天室消息订阅地址
     */
    String SUB_CHAT_ROOM = "/topic/chatRoom";
    /**
     * 异常消息订阅地址
     */
    String SUB_ERROR = "/error";
    /**
     * 用户上下线状态消息订阅地址
     */
    String SUB_STATUS = "/topic/status";
    /**
     * 聊天室消息撤消
     */
    String PUB_CHAT_ROOM_REVOKE = "/chatRoom/revoke";

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\constant\UserStatusConstant.java
```java
package cn.xeblog.xechat.constant;

/**
 * 用户状态常量
 *
 * @author yanpanyi
 * @date 2019/3/22
 */
public interface UserStatusConstant {

    /**
     * 离线
     */
    int OFFLINE = 0;
    /**
     * 上线
     */
    int ONLINE = 1;
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\controller\AuthController.java
```java
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
        ChatUser user = userService.login(loginInfo.getEmail(), loginInfo.getPassword());
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
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\controller\ChatHistoryController.java
```java
package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.service.ChatRecordService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    @Resource
    private ChatRecordService chatRecordService;

    @GetMapping("/history")
    public ResponseVO getHistory(@RequestParam(defaultValue = "20") int limit) {
        // 调用你在 ChatRecordServiceImpl 中实现的 getDatabaseHistory 方法
        return new ResponseVO(chatRecordService.getDatabaseHistory(limit));
    }
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\controller\ChatRecordController.java
```java
package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.service.ChatRecordService;
import com.alibaba.fastjson2.JSONObject;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.Resource;

@RestController
@RequestMapping("/api/record")
public class ChatRecordController {

    @Resource
    private ChatRecordService chatRecordService;

    @GetMapping
    public ResponseVO listChatRecord(@RequestParam(required = false, defaultValue = "") String directoryName) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("list", chatRecordService.listRecord(directoryName));
        return new ResponseVO(jsonObject);
    }
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\controller\UploadController.java
```java
package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.service.UploadService;
import com.alibaba.fastjson2.JSONObject;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.Resource;

/**
 * 上传文件
 *
 * @author yanpanyi
 * @date 2019/03/27
 */
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Resource
    private UploadService uploadService;

    /**
     * 上传图片
     *
     * @param multipartFile
     * @return
     * @throws Exception
     */
    @PostMapping("/image")
    public ResponseVO uploadImage(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("path", uploadService.uploadImage(multipartFile));

        return new ResponseVO(jsonObject);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\controller\XeChatController.java
```java
package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.annotation.ChatRecord;
import cn.xeblog.xechat.constant.RobotConstant;
import cn.xeblog.xechat.constant.StompConstant;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.domain.ro.MessageRO;
import cn.xeblog.xechat.domain.ro.RevokeMessageRO;
import cn.xeblog.xechat.domain.vo.MessageVO;
import cn.xeblog.xechat.domain.vo.RevokeMsgVo;
import cn.xeblog.xechat.entity.ChatUser;
import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import cn.xeblog.xechat.enums.inter.Code;
import cn.xeblog.xechat.exception.ErrorCodeException;
import cn.xeblog.xechat.service.MessageService;
import cn.xeblog.xechat.utils.CheckUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.Resource;

/**
 * 消息主控制器
 *
 * @author yanpanyi
 * @date 2019/3/20
 */
@RestController
@Slf4j
public class XeChatController {

    @Resource
    private MessageService messageService;

    /**
     * 聊天室发布订阅
     *
     * @param messageRO 消息请求对象
     * @param user 发送消息的用户对象
     * @throws Exception
     */
    @MessageMapping(StompConstant.PUB_CHAT_ROOM)
    public void chatRoom(MessageRO messageRO, User user) throws Exception {
        String message = messageRO.getMessage();

        if (!CheckUtils.checkMessageRo(messageRO) || !CheckUtils.checkUser(user)) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }
        if (CheckUtils.checkMessage(message) && message.startsWith(RobotConstant.prefix)) {
            messageService.sendMessageToRobot(StompConstant.SUB_CHAT_ROOM, message, user);
        }

        messageService.sendMessage(StompConstant.SUB_CHAT_ROOM, new MessageVO(user, message, messageRO.getImage(),
                MessageTypeEnum.USER));
    }

    /**
     * 发送消息到指定用户
     *
     * @param messageRO 消息请求对象
     * @param user 发送消息的用户对象
     * @throws Exception
     */
    @MessageMapping(StompConstant.PUB_USER)
    public void sendToUser(MessageRO messageRO, User user) throws Exception {
        if (!CheckUtils.checkMessageRo(messageRO) || !CheckUtils.checkUser(user)) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        messageService.sendMessageToUser(messageRO.getReceiver(), new MessageVO(user, messageRO.getMessage(),
                messageRO.getImage(), MessageTypeEnum.USER, messageRO.getReceiver()));
    }

    /**
     * 消息异常处理
     *
     * @param e 异常对象
     * @param user 发送消息的用户对象
     */
    @MessageExceptionHandler(Exception.class)
    public void handleExceptions(Exception e, User user) {
        Code code = CodeEnum.INTERNAL_SERVER_ERROR;

        if (e instanceof ErrorCodeException) {
            code = ((ErrorCodeException) e).getCode();
        } else {
            log.error("error:", e);
        }

        messageService.sendErrorMessage(code, user);
    }

    /**
     * 撤回消息（安全增强版）
     */
    @MessageMapping(StompConstant.PUB_CHAT_ROOM_REVOKE)
    public void revokeMessage(RevokeMessageRO revokeMessageRO, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        // 1. 统一从服务器 Session 获取身份
        ChatUser loginUser = (ChatUser) headerAccessor.getSessionAttributes().get("user");
        if (loginUser == null) {
            // 使用现有的常量
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        // 2. 构造后端可信的 User 对象
        User user = new User();
        user.setUserId(loginUser.getId().toString());
        user.setUsername(loginUser.getNickname());

        // 3. 执行原有校验逻辑
        if (revokeMessageRO == null) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        // 校验撤回的消息是否属于当前登录用户
        CheckUtils.checkMessageId(revokeMessageRO.getMessageId(), user.getUserId());

        RevokeMsgVo revokeMsgVo = new RevokeMsgVo();
        revokeMsgVo.setRevokeMessageId(revokeMessageRO.getMessageId());
        revokeMsgVo.setUser(user);
        revokeMsgVo.setType(MessageTypeEnum.REVOKE);

        if (CheckUtils.checkReceiver(revokeMessageRO.getReceiver())) {
            messageService.sendMessageToUser(revokeMessageRO.getReceiver(), revokeMsgVo);
            return;
        }

        messageService.sendMessage(StompConstant.SUB_CHAT_ROOM, revokeMsgVo);
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\dto\ChatRecordDTO.java
```java
package cn.xeblog.xechat.domain.dto;

import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.domain.vo.MessageVO;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.beans.BeanUtils;

/**
 * 聊天记录数据传输层
 *
 * @author yanpanyi
 * @date 2019/4/4
 */
@Getter
@Setter
@ToString
public class ChatRecordDTO {

    /**
     * 用户信息
     */
    private User user;
    /**
     * 消息
     */
    private String message;
    /**
     * 图片
     */
    private String image;
    /**
     * 消息类型
     */
    private MessageTypeEnum type;
    /**
     * 发送时间
     */
    private String sendTime;

    public static ChatRecordDTO toChatRecordDTO(MessageVO messageVO) {
        if (null == messageVO) {
            return null;
        }

        ChatRecordDTO chatRecordDTO = new ChatRecordDTO();
        BeanUtils.copyProperties(messageVO, chatRecordDTO);

        return chatRecordDTO;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\mo\User.java
```java
package cn.xeblog.xechat.domain.mo;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.security.Principal;

/**
 * 用户信息
 *
 * @author yanpanyi
 * @date 2019/3/22
 */
@Getter
@Setter
@ToString
public class User implements Principal, Serializable {

    private static final long serialVersionUID = 5114506546129512029L;

    /**
     * 用户id
     */
    private String userId;
    /**
     * 用户昵称
     */
    private String username;
    /**
     * 地址
     */
    private String address;
    /**
     * 头像
     */
    private String avatar;
    /**
     * 用户状态
     */
    private int status;

    @Override
    public String getName() {
        return userId;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\ro\MessageRO.java
```java
package cn.xeblog.xechat.domain.ro;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.commons.lang3.ArrayUtils;

import java.io.Serializable;

/**
 * 消息请求
 *
 * @author yanpanyi
 * @date 2019/3/20
 */
@Getter
@Setter
@ToString
public class MessageRO implements Serializable {

    private static final long serialVersionUID = 3544216886850149310L;

    /**
     * 接收者
     */
    private String[] receiver;
    /**
     * 消息
     */
    private String message;
    /**
     * 图片
     */
    private String image;

    public String[] getReceiver() {
        return ArrayUtils.clone(receiver);
    }

    public void setReceiver(String[] receiver) {
        this.receiver = ArrayUtils.clone(receiver);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\ro\RevokeMessageRO.java
```java
package cn.xeblog.xechat.domain.ro;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.commons.lang3.ArrayUtils;

import java.io.Serializable;

/**
 * 撤消消息请求
 *
 * @author anlingyi
 * @date 2019/6/28
 */
@Getter
@Setter
@ToString
public class RevokeMessageRO implements Serializable {

    private static final long serialVersionUID = -8463062216437674093L;

    /**
     * 接收者
     */
    private String[] receiver;
    /**
     * 消息id
     */
    private String messageId;

    public String[] getReceiver() {
        return ArrayUtils.clone(receiver);
    }

    public void setReceiver(String[] receiver) {
        this.receiver = ArrayUtils.clone(receiver);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\vo\DynamicMsgVo.java
```java
package cn.xeblog.xechat.domain.vo;

import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import lombok.*;

import java.util.List;

/**
 * 聊天室动态消息
 *
 * @author yanpanyi
 * @date 2019/3/22
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
public class DynamicMsgVo extends MessageVO {

    /**
     * 在线人数
     */
    private int onlineCount;

    /**
     * 在线用户列表
     */
    private List<User> onlineUserList;

    @Override
    public MessageTypeEnum getType() {
        return MessageTypeEnum.SYSTEM;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\vo\MessageVO.java
```java
package cn.xeblog.xechat.domain.vo;

import cn.xeblog.xechat.constant.DateConstant;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import cn.xeblog.xechat.utils.DateUtils;
import lombok.*;

import java.io.Serializable;

/**
 * 消息视图
 *
 * @author yanpanyi
 * @date 2019/3/20
 */
@ToString
@NoArgsConstructor
public class MessageVO implements Serializable {

    private static final long serialVersionUID = -1455469852669257711L;

    private Long timestamp = System.currentTimeMillis();

    /**
     * 用户
     */
    @Getter
    @Setter
    private User user;
    /**
     * 消息信息
     */
    @Getter
    @Setter
    private String message;
    /**
     * 图片
     */
    @Getter
    @Setter
    private String image;
    /**
     * 消息类型
     */
    @Getter
    @Setter
    private MessageTypeEnum type;
    /**
     * 消息id
     */
    private String messageId;
    /**
     * 发送时间
     */
    private String sendTime;

    /**
     * 接收者
     */
    @Getter
    @Setter
    private String[] receiver;

    public MessageVO(User user, String message, String image, MessageTypeEnum type, String[] receiver) {
        this.user = user;
        this.message = message;
        this.image = image;
        this.type = type;
        this.receiver = receiver;
    }

    public MessageVO(User user, String message, String image, MessageTypeEnum type) {
        this.user = user;
        this.message = message;
        this.image = image;
        this.type = type;
    }

    public MessageVO(User user, String message, MessageTypeEnum type) {
        this.user = user;
        this.message = message;
        this.type = type;
    }

    public String getSendTime() {
        return DateUtils.getDate(timestamp, DateConstant.SEND_TIME_FORMAT);
    }

    public String getMessageId() {
        return user.getUserId() + ':' + timestamp;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\vo\ResponseVO.java
```java
package cn.xeblog.xechat.domain.vo;

import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.enums.inter.Code;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * 响应数据结构
 *
 * @author yanpanyi
 * @date 2019/3/20
 */
@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseVO implements Serializable {

    private static final long serialVersionUID = -5327212050370584991L;
    private static final CodeEnum SUCCESS = CodeEnum.SUCCESS;

    /**
     * 响应码
     */
    private Integer code;
    /**
     * 响应数据
     */
    private Object data;
    /**
     * 响应描述
     */
    private String desc;

    /**
     * 成功响应且带响应数据
     *
     * @param data 响应数据
     */
    public ResponseVO(Object data) {
        this.code = SUCCESS.getCode();
        this.desc = SUCCESS.getDesc();
        this.data = data;
    }

    /**
     * 只带响应code和desc
     *
     * @param code 响应code
     */
    public ResponseVO(Code code) {
        this.code = code.getCode();
        this.desc = code.getDesc();
    }


}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\domain\vo\RevokeMsgVo.java
```java
package cn.xeblog.xechat.domain.vo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 撤消消息
 *
 * @author yanpanyi
 * @date 2019/3/25
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
public class RevokeMsgVo extends MessageVO {

    /**
     * 撤回的消息id
     */
    private String revokeMessageId;
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\entity\ChatHistory.java
```java
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


```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\entity\ChatUser.java
```java
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
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\enums\CodeEnum.java
```java
package cn.xeblog.xechat.enums;

import cn.xeblog.xechat.enums.inter.Code;

/**
 * 响应码枚举
 *
 * @author yanpanyi
 * @date 2019/3/20
 */
public enum CodeEnum implements Code {

    /**
     * 上传的文件不是图片
     */
    UPLOADED_FILE_IS_NOT_AN_IMAGE(1002, "上传的文件不是图片!"),
    /**
     * 消息已过期
     */
    MESSAGE_HAS_EXPIRED(1001, "消息已过期，不能撤回！"),
    /**
     * 服务器内部错误
     */
    INTERNAL_SERVER_ERROR(500, "网络异常！"),
    /**
     * 参数验证失败
     */
    INVALID_PARAMETERS(501, "非法参数！"),
    /**
     * Token验证不通过
     */
    INVALID_TOKEN(502, "没有权限！"),
    /**
     * 处理失败
     */
    FAILED(503, "处理失败！"),
    /**
     * 响应成功
     */
    SUCCESS(200, "Success");

    private int code;
    private String desc;

    CodeEnum(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }


    @Override
    public int getCode() {
        return code;
    }

    @Override
    public String getDesc() {
        return desc;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\enums\MessageTypeEnum.java
```java
package cn.xeblog.xechat.enums;

/**
 * 消息类型枚举
 *
 * @author yanpanyi
 * @date 2019/3/22
 */
public enum MessageTypeEnum {
    SYSTEM,
    USER,
    REVOKE,
    ROBOT
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\enums\inter\Code.java
```java
package cn.xeblog.xechat.enums.inter;

/**
 * 获取响应code
 *
 * @author yanpanyi
 * @date 2019/3/22
 */
public interface Code {

    /**
     * 获取响应码
     *
     * @return
     */
    int getCode();

    /**
     * 获取响应码描述
     *
     * @return
     */
    String getDesc();
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\exception\ErrorCodeException.java
```java
package cn.xeblog.xechat.exception;

import cn.xeblog.xechat.enums.inter.Code;

/**
 * 返回错误码
 *
 * @author yanpanyi
 * @date 2019/3/20
 */
public class ErrorCodeException extends Exception {

    private Code code;

    public ErrorCodeException(Code code) {
        this.code = code;
    }

    public Code getCode() {
        return code;
    }

    public void setCode(Code code) {
        this.code = code;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\exception\handler\ExceptionHandle.java
```java
package cn.xeblog.xechat.exception.handler;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.exception.ErrorCodeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 异常处理
 *
 * @author yanpanyi
 */
@Slf4j
@RestControllerAdvice
public class ExceptionHandle {

    @ExceptionHandler(value = Exception.class)
    public ResponseVO exceptionHandler(Exception e) {
        log.error("error:", e);
        return new ResponseVO(CodeEnum.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = ErrorCodeException.class)
    public ResponseVO errorCodeHandler(ErrorCodeException e) {
        return new ResponseVO(e.getCode());
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\interceptor\PermissionInterceptor.java
```java
package cn.xeblog.xechat.interceptor;

import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.exception.ErrorCodeException;
import cn.xeblog.xechat.utils.CheckUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 权限校验拦截器
 *
 * @author yanpanyi
 * @date 2019/4/5
 */
@Component
@Slf4j
public class PermissionInterceptor implements HandlerInterceptor {

    private final static String TOKEN = "token";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws ErrorCodeException {
        String token = request.getHeader(PermissionInterceptor.TOKEN);

        log.info("权限校验 token -> {}", token);

        if (CheckUtils.checkToken(token)) {
            return true;
        }

        log.info("没有权限");

        throw new ErrorCodeException(CodeEnum.INVALID_TOKEN);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\interceptor\WebSocketInterceptor.java
```java
package cn.xeblog.xechat.interceptor;

import cn.xeblog.xechat.constant.UserStatusConstant;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.entity.ChatUser;
import cn.xeblog.xechat.utils.SensitiveWordUtils;
import cn.xeblog.xechat.utils.UUIDUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;

import java.util.Map;
import java.util.UUID;

/**
 * webcocket拦截器
 *
 * @author yanpanyi
 * @date 2019/3/24
 */
@Component
@Slf4j
public class WebSocketInterceptor implements ChannelInterceptor {

    /**
     * 绑定用户信息
     *
     * @param message
     * @param channel
     * @return
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        log.debug("进入拦截器 -> preSend");
        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(stompHeaderAccessor.getCommand())) {
            User user = new User();
            user.setUserId(UUIDUtils.create());
            user.setUsername(SensitiveWordUtils.loveChina(stompHeaderAccessor.getFirstNativeHeader("username")));
            user.setAvatar(stompHeaderAccessor.getFirstNativeHeader("avatar"));
            user.setAddress(stompHeaderAccessor.getFirstNativeHeader("address"));
            user.setStatus(UserStatusConstant.ONLINE);

            stompHeaderAccessor.setUser(user);
            log.debug("绑定用户信息 -> {}", user);
        }

        return message;
    }

    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
            // 从登录时设置的 Session 中获取用户
            ChatUser user = (ChatUser) servletRequest.getSession().getAttribute("user");

            if (user == null) {
                log.warn("拒绝未登录用户的 WebSocket 连接请求");
                return false; // 拒绝连接
            }

            // 将用户信息存入 WebSocket 会话属性
            attributes.put("user", user);
        }
        return true;
    }

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\listener\WebSocketEventListener.java
```java
package cn.xeblog.xechat.listener;

import cn.xeblog.xechat.cache.UserCache;
import cn.xeblog.xechat.constant.MessageConstant;
import cn.xeblog.xechat.constant.StompConstant;
import cn.xeblog.xechat.constant.UserStatusConstant;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.domain.vo.DynamicMsgVo;
import cn.xeblog.xechat.domain.vo.MessageVO;
import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.exception.ErrorCodeException;
import cn.xeblog.xechat.service.MessageService;
import cn.xeblog.xechat.utils.CheckUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import jakarta.annotation.Resource;

/**
 * websocket事件监听
 *
 * @author yanpanyi
 * @date 2019/3/24
 */
@Slf4j
@Component
public class WebSocketEventListener {

    @Resource
    private MessageService messageService;

    private User user;

    /**
     * 建立连接监听
     *
     * @param sessionConnectedEvent
     */
    @EventListener
    public void handleConnectListener(SessionConnectedEvent sessionConnectedEvent) throws ErrorCodeException {
        log.debug("建立连接 -> {}", sessionConnectedEvent);

        user = (User) sessionConnectedEvent.getUser();
        if (!CheckUtils.checkUser(user)) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        UserCache.addUser(user.getUserId(), user);
    }

    /**
     * 断开连接监听
     *
     * @param sessionDisconnectEvent
     */
    @EventListener
    public void handleDisconnectListener(SessionDisconnectEvent sessionDisconnectEvent) throws Exception {
        log.debug("断开连接 -> {}", sessionDisconnectEvent);

        String userId = sessionDisconnectEvent.getUser().getName();
        User user = UserCache.getUser(userId);
        if (null == user) {
            log.debug("用户不存在 uid ->", userId);
            return;
        }

        user.setStatus(UserStatusConstant.OFFLINE);
        UserCache.removeUser(userId);

        // 广播离线消息
        sendMessage(buildMessageVo(user, MessageConstant.OFFLINE_MESSAGE));
        log.debug("广播离线消息 -> {}", user);
    }

    /**
     * 订阅监听
     *
     * @param sessionSubscribeEvent
     */
    @EventListener
    public void handleSubscribeListener(SessionSubscribeEvent sessionSubscribeEvent) throws Exception {
        log.debug("新的订阅 -> {}", sessionSubscribeEvent);
        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(sessionSubscribeEvent.getMessage(),
                StompHeaderAccessor.class);

        if (StompConstant.SUB_STATUS.equals(stompHeaderAccessor.getFirstNativeHeader(StompHeaderAccessor
                .STOMP_DESTINATION_HEADER))) {
            if (user != null) {
                try {
                    // 延迟100ms，防止客户端来不及接收上线消息
                    Thread.sleep(100L);
                } catch (InterruptedException e) {
                    log.error("中断异常，error -> {}", e);
                }

                // 广播上线消息
                sendMessage(buildMessageVo(user, MessageConstant.ONLINE_MESSAGE));
                // 发送机器人欢迎消息
                sendRobotMessage(String.format(MessageConstant.ROBOT_WELCOME_MESSAGE, user.getUsername()));
                log.debug("广播上线消息 -> {}", user);
            }

        }
    }

    /**
     * 构建消息视图
     *
     * @param user
     * @return
     */
    private MessageVO buildMessageVo(User user, String message) {
        DynamicMsgVo dynamicMsgVo = new DynamicMsgVo();
        dynamicMsgVo.setUser(user);
        dynamicMsgVo.setMessage(String.format(message, user.getUsername()));
        dynamicMsgVo.setOnlineCount(UserCache.getOnlineCount());
        dynamicMsgVo.setOnlineUserList(UserCache.listUser());

        return dynamicMsgVo;
    }

    /**
     * 发送订阅消息，广播用户动态
     *
     * @param messageVO
     */
    private void sendMessage(MessageVO messageVO) throws Exception {
        messageService.sendMessage(StompConstant.SUB_STATUS, messageVO);
    }

    /**
     * 发送机器人消息
     *
     * @param message
     * @throws Exception
     */
    private void sendRobotMessage(String message) throws Exception {
        messageService.sendRobotMessage(StompConstant.SUB_CHAT_ROOM, message);
    }
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\mapper\ChatHistoryMapper.java
```java
package cn.xeblog.xechat.mapper;

import cn.xeblog.xechat.entity.ChatHistory;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChatHistoryMapper extends BaseMapper<ChatHistory> {
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\mapper\ChatUserMapper.java
```java
package cn.xeblog.xechat.mapper;

import cn.xeblog.xechat.entity.ChatUser;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChatUserMapper extends BaseMapper<ChatUser> {
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\ChatRecordService.java
```java
package cn.xeblog.xechat.service;

import cn.xeblog.xechat.domain.dto.ChatRecordDTO;
import cn.xeblog.xechat.entity.ChatHistory;

import java.util.HashMap;
import java.util.List;

/**
 * 聊天记录
 *
 * @author yanpanyi
 * @date 2019/4/4
 */
public interface ChatRecordService {

    /**
     * 添加聊天记录
     *
     * @param chatRecordDTO 聊天记录对象
     */
    void addRecord(ChatRecordDTO chatRecordDTO);

    /**
     * 聊天记录列表
     *
     * @param directoryName 目录名
     * @return 聊天记录列表
     */
    List<HashMap<String, Object>> listRecord(String directoryName);
    /**
     * 从数据库获取最近的历史记录
     * @param limit 查询条数
     * @return 历史记录列表
     */
    List<ChatHistory> getDatabaseHistory(int limit);
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\IUserService.java
```java
package cn.xeblog.xechat.service;

import cn.xeblog.xechat.entity.ChatUser;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IUserService extends IService<ChatUser> {
    // 登录验证
    ChatUser login(String username, String password);
    // 注册逻辑（含画像初始化）
    boolean register(ChatUser user);
}
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\MessageService.java
```java
package cn.xeblog.xechat.service;

import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.domain.vo.MessageVO;
import cn.xeblog.xechat.enums.inter.Code;

/**
 * 消息处理
 *
 * @author yanpanyi
 * @date 2019/4/15
 */
public interface MessageService {

    /**
     * 发送消息
     *
     * @param subAddress 消息订阅地址
     * @param messageVO  消息视图
     * @throws Exception
     */
    void sendMessage(String subAddress, MessageVO messageVO) throws Exception;

    /**
     * 发送消息到指定用户
     *
     * @param receiver  消息接收者，是一个存入用户id的string数组
     * @param messageVO 消息视图
     * @throws Exception
     */
    void sendMessageToUser(String[] receiver, MessageVO messageVO) throws Exception;

    /**
     * 发送错误消息
     *
     * @param code 错误码
     * @param user 发送消息的用户信息，将发送错误消息到该用户
     */
    void sendErrorMessage(Code code, User user);

    /**
     * 发送消息到机器人
     *
     * @param subAddress 消息订阅地址
     * @param message    消息文本
     * @param user       发送消息的用户信息
     * @throws Exception
     */
    void sendMessageToRobot(String subAddress, String message, User user) throws Exception;

    /**
     * 发送机器人消息
     *
     * @param subAddress 消息订阅地址
     * @param message    消息文本
     * @throws Exception
     */
    void sendRobotMessage(String subAddress, String message) throws Exception;

}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\RobotService.java
```java
package cn.xeblog.xechat.service;

/**
 * 机器人
 *
 * @author yanpanyi
 * @date 2019/4/9
 */
public interface RobotService {

    /**
     * 发送消息到机器人
     *
     * @param userId 发送人userId
     * @param text 发送的消息内容
     * @return 机器人的答复信息
     */
    String sendMessage(String userId, String text);
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\UploadService.java
```java
package cn.xeblog.xechat.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 上传文件
 *
 * @author yanpanyi
 * @date 2019/3/27
 */
public interface UploadService {

    /**
     * 上传图片
     *
     * @param multipartFile
     * @return 上传的图片路径
     * @throws Exception
     */
    String uploadImage(MultipartFile multipartFile) throws Exception;
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\impl\ChatRecordServiceImpl.java
```java
 package cn.xeblog.xechat.service.impl;

import cn.xeblog.xechat.constant.DateConstant;
import cn.xeblog.xechat.domain.dto.ChatRecordDTO;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.entity.ChatHistory;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import cn.xeblog.xechat.mapper.ChatHistoryMapper; // 需要新建这个 Mapper
import cn.xeblog.xechat.service.ChatRecordService;
import cn.xeblog.xechat.utils.DateUtils;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.io.*;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class ChatRecordServiceImpl implements ChatRecordService {

    @Resource
    private ChatHistoryMapper chatHistoryMapper; // 注入数据库操作接口

    @Value("${chatrecord.path}")
    private String path;

    @Value("${chatrecord.accessAddress}")
    private String accessAddress;

    private static final String FILE_SUFFIX = ".md";

    @Async
    @Override
    public void addRecord(ChatRecordDTO chatRecordDTO) {
        log.info("准备存入数据库，当前用户ID: {}, 消息内容: {}",
                chatRecordDTO.getUser().getUserId(), chatRecordDTO.getMessage());

        if (null == chatRecordDTO || chatRecordDTO.getUser() == null) return;
        if (chatRecordDTO.getType() == MessageTypeEnum.USER || chatRecordDTO.getType() == MessageTypeEnum.ROBOT) {
            try {
                String rawUserId = chatRecordDTO.getUser().getUserId();

                // 增加校验：只有当 userId 是纯数字时才存入数据库
                if (StringUtils.isNumeric(rawUserId)) {
                    ChatHistory history = new ChatHistory();
                    history.setUserId(Long.parseLong(rawUserId));
                    history.setContent(chatRecordDTO.getMessage());
                    history.setCreateTime(LocalDateTime.now());
                    chatHistoryMapper.insert(history);
                } else {
                    log.warn("当前用户ID为非数字格式(UUID): {}，跳过数据库存储", rawUserId);
                }
            } catch (Exception e) {
                log.error("数据库存储记录失败", e);
            }
        }

        // 1. 持久化到数据库（新增逻辑）
        // 仅记录用户或机器人发送的有效消息内容
        if (chatRecordDTO.getType() == MessageTypeEnum.USER || chatRecordDTO.getType() == MessageTypeEnum.ROBOT) {
            try {
                ChatHistory history = new ChatHistory();
                // 这里的 userId 需要从 User 对象获取，确保它是数据库中的 BIGINT id
                history.setUserId(Long.parseLong(chatRecordDTO.getUser().getUserId()));
                history.setContent(chatRecordDTO.getMessage());
                history.setCreateTime(LocalDateTime.now());
                chatHistoryMapper.insert(history);
            } catch (Exception e) {
                log.error("数据库存储聊天记录失败", e);
            }
        }

        // 2. 原有的文件存储逻辑（保留作为备份）
        saveToFile(chatRecordDTO);
    }

    /**
     * 将原有的文件写入逻辑封装
     */
    private void saveToFile(ChatRecordDTO chatRecordDTO) {
        File file = new File(createFileName());
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        try (BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, true), "UTF-8"))) {
            out.write(formatContent(chatRecordDTO));
        } catch (IOException e) {
            log.error("添加文件记录异常", e);
        }
    }
    private String createFileName() {
        Calendar calendar = Calendar.getInstance();
        StringBuffer sb = new StringBuffer();
        sb.append(path);
        sb.append(calendar.get(Calendar.YEAR));
        sb.append(File.separator);
        sb.append(calendar.get(Calendar.MONTH) + 1);
        sb.append(File.separator);
        sb.append(DateUtils.getDate(calendar.getTime(), DateConstant.CHAT_RECORD_FILE_NAME));
        sb.append(FILE_SUFFIX);

        return sb.toString();
    }

    /**
     * 格式化内容
     *
     * @param chatRecordDTO 聊天记录对象
     * @return 格式化后的字符串
     */
    private String formatContent(ChatRecordDTO chatRecordDTO) {
        if (null == chatRecordDTO) {
            return "";
        }

        StringBuffer sb = new StringBuffer();

        User user = chatRecordDTO.getUser();
        switch (chatRecordDTO.getType()) {
            case ROBOT:
            case USER:
                formatUserMsg(sb, chatRecordDTO);
                break;
            case SYSTEM:
                formatSystemMsg(sb, chatRecordDTO);
                break;
            case REVOKE:
                chatRecordDTO.setMessage(user.getUsername() + "撤回了一条消息！");
                formatSystemMsg(sb, chatRecordDTO);
                break;
            default:
                break;
        }

        return sb.toString();
    }

    @Override
    public List<HashMap<String, Object>> listRecord(String directoryName) {
        File file = new File(path + directoryName);
        if (!file.exists()) {
            return null;
        }

        String[] tempList = file.list();
        if (tempList == null || tempList.length < 1) {
            return null;
        }

        List<HashMap<String, Object>> list = new ArrayList<>(tempList.length);
        HashMap<String, Object> map;
        String url = null;
        for (String name : tempList) {
            map = new HashMap<>(3, 1.0f);
            // 是否是文件
            boolean isFile = name.lastIndexOf(FILE_SUFFIX) != -1;
            if (isFile) {
                // 文件访问地址
                url = accessAddress + directoryName + name;
            }
            map.put("name", name);
            map.put("url", url);
            map.put("file", isFile);

            list.add(map);
        }

        return list;
    }

    /**
     * 格式化系统类型的消息
     *
     * @param sb StringBuffer对象
     * @param chatRecordDTO 聊天记录对象
     */
    private void formatSystemMsg(StringBuffer sb, ChatRecordDTO chatRecordDTO) {
        sb.append("#### [");
        sb.append(chatRecordDTO.getSendTime());
        sb.append("] 系统消息：\r\n");
        sb.append("> ");
        sb.append(chatRecordDTO.getMessage());
        sb.append("\r\n");
    }

    /**
     * 格式化用户类型的消息
     *
     * @param sb StringBuffer对象
     * @param chatRecordDTO 聊天记录对象
     */
    private void formatUserMsg(StringBuffer sb, ChatRecordDTO chatRecordDTO) {
        final User user = chatRecordDTO.getUser();
        String tag = chatRecordDTO.getType() == MessageTypeEnum.ROBOT ? "[系统机器人] " : "";
        sb.append("#### [");
        sb.append(chatRecordDTO.getSendTime());
        sb.append("] ");
        sb.append(tag);
        sb.append(user.getUsername());
        sb.append("(");
        sb.append(user.getAddress());
        sb.append(")：\r\n");

        if (!StringUtils.isEmpty(chatRecordDTO.getImage())) {
            sb.append("> ![](");
            sb.append(chatRecordDTO.getImage());
            sb.append(")\r\n");
        }
        if (!StringUtils.isEmpty(chatRecordDTO.getMessage())) {
            sb.append("> ");
            sb.append(StringEscapeUtils.escapeHtml4(chatRecordDTO.getMessage()));
            sb.append("\r\n");
        }
    }
    @Override
    public List<ChatHistory> getDatabaseHistory(int limit) {
        // 查询最近的 limit 条记录，按时间倒序排
        QueryWrapper<ChatHistory> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("create_time").last("limit " + limit);

        List<ChatHistory> list = chatHistoryMapper.selectList(wrapper);
        // 转换成正序，方便前端从上往下显示
        Collections.reverse(list);
        return list;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\impl\MessageServiceImpl.java
```java
package cn.xeblog.xechat.service.impl;

import cn.xeblog.xechat.annotation.ChatRecord;
import cn.xeblog.xechat.cache.UserCache;
import cn.xeblog.xechat.constant.RobotConstant;
import cn.xeblog.xechat.constant.StompConstant;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.domain.vo.MessageVO;
import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import cn.xeblog.xechat.enums.inter.Code;
import cn.xeblog.xechat.exception.ErrorCodeException;
import cn.xeblog.xechat.service.MessageService;
import cn.xeblog.xechat.service.RobotService;
import cn.xeblog.xechat.utils.CheckUtils;
import cn.xeblog.xechat.utils.SpringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;

/**
 * @author yanpanyi
 * @date 2019/4/18
 */
@Service
@Slf4j
public class MessageServiceImpl implements MessageService {

    @Resource
    private SimpMessagingTemplate messagingTemplate;
    @Resource
    private RobotService robotService;

    @Override
    public void sendErrorMessage(Code code, User user) {
        log.info("发送错误信息 -> {} -> {}", code, user);
        messagingTemplate.convertAndSendToUser(user.getUserId(), StompConstant.SUB_ERROR, new ResponseVO(code));
    }

    @ChatRecord
    @Override
    public void sendMessage(String subAddress, MessageVO messageVO) throws Exception {
        if (!CheckUtils.checkSubAddress(subAddress)) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        messagingTemplate.convertAndSend(subAddress, buildResponseVo(messageVO));
    }

    @ChatRecord
    @Override
    public void sendMessageToUser(String[] receiver, MessageVO messageVO) throws Exception {
        if (!CheckUtils.checkReceiver(receiver)) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        ResponseVO responseVO = buildResponseVo(messageVO);
        for (int i = 0, len = receiver.length; i < len; i++) {
            // 将消息发送到指定用户 参数说明：1.消息接收者 2.消息订阅地址 3.消息内容
            messagingTemplate.convertAndSendToUser(receiver[i], StompConstant.SUB_USER, responseVO);
        }
    }

    private ResponseVO buildResponseVo(MessageVO messageVO) throws ErrorCodeException {
        if (messageVO == null) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        return new ResponseVO(messageVO);
    }

    @Async
    @Override
    public void sendMessageToRobot(String subAddress, String message, User user) throws Exception {
        log.info("user: {} -> 发送消息到机器人 -> {}", user, message);
        String robotMessage = robotService.sendMessage(user.getUserId(), message.replaceFirst(RobotConstant.prefix,
                ""));
        log.info("机器人响应结果 -> {}", robotMessage);
        sendRobotMessage(subAddress, robotMessage);
    }

    @Override
    public void sendRobotMessage(String subAddress, String message) throws Exception {
        SpringUtils.getBean(this.getClass()).sendMessage(subAddress, new MessageVO(UserCache.getUser(RobotConstant.key),
                message, MessageTypeEnum.ROBOT));
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\impl\TuRingRobotServiceImpl.java
```java
package cn.xeblog.xechat.service.impl;

import cn.xeblog.xechat.service.RobotService;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringEscapeUtils;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.Resource;

/**
 * 使用图灵机器人api的实现
 *
 * @author yanpanyi
 * @date 2019/4/9
 */
@Service
@Slf4j
public class TuRingRobotServiceImpl implements RobotService {

    @Resource
    private RestTemplate restTemplate;

    /**
     * api地址
     */
    @Value("${turing.apiUrl}")
    private String apiUrl;

    /**
     * apikey
     */
    @Value("${turing.apiKey}")
    private String apiKey;

    @Override
    public String sendMessage(String userId, String text) {
        ResponseEntity<JSONObject> resp = restTemplate.exchange(apiUrl, HttpMethod.POST,
                buildHttpEntity(userId, text), JSONObject.class);

        return parseData(resp);
    }

    /**
     * 构建请求实体
     *
     * @param userId 用户id
     * @param text 消息内容
     * @return HttpEntity
     */
    private HttpEntity buildHttpEntity(String userId, String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        JSONObject inputText = new JSONObject();
        inputText.put("text", text);

        JSONObject input = new JSONObject();
        input.put("inputText", inputText);

        JSONObject userInfo = new JSONObject();
        userInfo.put("apiKey", apiKey);
        userInfo.put("userId", userId);

        JSONObject body = new JSONObject();
        body.put("reqType", 0);
        body.put("perception", input);
        body.put("userInfo", userInfo);

        return new HttpEntity(body, headers);
    }

    /**
     * 解析响应数据
     *
     * @param resp 响应数据
     * @return 解析后的字符串
     */
    private String parseData(ResponseEntity<JSONObject> resp) {
        if (resp.getStatusCode() != HttpStatus.OK) {
            return null;
        }

        StringBuffer sb = new StringBuffer();
        JSONObject data = resp.getBody();
        log.debug("data -> {}", data);

        JSONArray results = data.getJSONArray("results");

        JSONObject obj;
        JSONObject values;
        JSONArray news;
        JSONObject newsInfo;
        for (int i = 0; i < results.size(); i++) {
            obj = results.getJSONObject(i);
            String type = obj.getString("resultType");
            values = obj.getJSONObject("values");

            switch (type) {
                case "text":
                    sb.append(StringEscapeUtils.unescapeHtml4(values.getString("text")));
                    break;
                case "url":
                    String url = values.getString("url");
                    sb.append("<a href='");
                    sb.append(url);
                    sb.append("' target='_blank'>");
                    sb.append(url);
                    sb.append("</a><br/>");
                    break;
                case "news":
                    news = values.getJSONArray("news");
                    for (int j = 0; j < news.size(); j++) {
                        newsInfo = news.getJSONObject(j);
                        sb.append("<br/><a href='");
                        sb.append(newsInfo.getString("detailurl"));
                        sb.append("' target='_blank'>");
                        sb.append(j + 1);
                        sb.append(". ");
                        sb.append(newsInfo.getString("name"));
                        sb.append("</a>");
                        sb.append("<br/><img src='");
                        sb.append(newsInfo.getString("icon"));
                        sb.append("' >");
                    }
                    break;
                default:
                    break;
            }
        }

        return sb.toString();
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\impl\UploadServiceImpl.java
```java
package cn.xeblog.xechat.service.impl;

import cn.xeblog.xechat.config.FileConfig;
import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.exception.ErrorCodeException;
import cn.xeblog.xechat.service.UploadService;
import cn.xeblog.xechat.utils.CheckUtils;
import cn.xeblog.xechat.utils.UUIDUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.Resource;
import java.io.File;

/**
 * @author yanpanyi
 * @date 2019/3/27
 */
@Service
@Slf4j
public class UploadServiceImpl implements UploadService {

    @Resource
    private FileConfig fileConfig;

    @Override
    public String uploadImage(MultipartFile multipartFile) throws Exception {
        if (multipartFile.isEmpty()) {
            throw new ErrorCodeException(CodeEnum.FAILED);
        }

        return execute(multipartFile);
    }

    private String execute(MultipartFile multipartFile) throws Exception {
        String originalFilename = multipartFile.getOriginalFilename();
        if (StringUtils.isEmpty(originalFilename)) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        String type = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        if (!CheckUtils.isImage(type)) {
            throw new ErrorCodeException(CodeEnum.UPLOADED_FILE_IS_NOT_AN_IMAGE);
        }

        String fileName = UUIDUtils.create() + "." + type;
        String respPath = fileConfig.getAccessAddress() + fileName;

        File file = new File(fileConfig.getDirectoryMapping() + fileConfig.getUploadPath() + fileName);
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        multipartFile.transferTo(file);

        return respPath;
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\service\impl\UserServiceImpl.java
```java
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
```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\utils\CheckUtils.java
```java
package cn.xeblog.xechat.utils;

import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.domain.ro.MessageRO;
import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.exception.ErrorCodeException;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 校验相关
 *
 * @author yanpanyi
 * @date 2019/3/25
 */
@Component
public class CheckUtils {

    /**
     * 撤消消息过期时间 3分钟
     */
    private static final long MESSAGE_EXPIRE_DATE = 180000;

    /**
     * 设置的访问密码
     */
    private static String password;

    @Value("${chatrecord.password}")
    public void setPassword(String password) {
        CheckUtils.password = password;
    }

    /**
     * 校验撤消的消息id
     *
     * @param messageId 消息id
     * @throws ErrorCodeException
     */
    public static void checkMessageId(String messageId, String userId) throws ErrorCodeException {
        if (StringUtils.isEmpty(messageId)) {
            throw new ErrorCodeException(CodeEnum.INVALID_PARAMETERS);
        }

        String[] str = StringUtils.split(messageId, ':');

        if (!userId.equals(str[0])) {
            throw new ErrorCodeException(CodeEnum.INVALID_TOKEN);
        }

        // 判断消息是否过期
        if (System.currentTimeMillis() > Long.parseLong(str[1]) + MESSAGE_EXPIRE_DATE) {
            throw new ErrorCodeException(CodeEnum.MESSAGE_HAS_EXPIRED);
        }
    }

    /**
     * 判断是否是图片
     *
     * @param type 类型
     * @return true是图片 false不是图片
     */
    public static boolean isImage(String type) {
        switch (StringUtils.lowerCase(type)) {
            case "jpg":
            case "png":
            case "bmp":
            case "gif":
            case "jpeg":
                return true;
            default:
                return false;
        }
    }

    /**
     * 校验token
     *
     * @param token 访问令牌
     * @return true:合法 false:不合法
     */
    public static boolean checkToken(String token) {
        return StringUtils.isNotEmpty(token) && password.equals(DigestUtils.md5Hex(token));
    }

    /**
     * 校验用户信息
     *
     * @param user 用户对象
     * @return true:合法 false:不合法
     */
    public static boolean checkUser(User user) {
        return null != user && StringUtils.isNotEmpty(user.getUserId());
    }

    /**
     * 校验消息内容
     *
     * @param message 消息内容
     * @return true:合法 false:不合法
     */
    public static boolean checkMessage(String message) {
        return StringUtils.isNotEmpty(message);
    }

    /**
     * 校验图片地址
     *
     * @param image 图片访问地址
     * @return true:合法 false:不合法
     */
    public static boolean checkImageUrl(String image) {
        return StringUtils.isNotEmpty(image);
    }

    /**
     * 校验消息请求对象
     *
     * @param messageRO 消息请求对象
     * @return true:合法 false:不合法
     */
    public static boolean checkMessageRo(MessageRO messageRO) {
        if (messageRO == null) {
            return false;
        }

        return checkMessage(messageRO.getMessage()) || checkImageUrl(messageRO.getImage());
    }

    /**
     * 校验订阅地址
     *
     * @param subAddress 订阅地址
     * @return true:合法 false:不合法
     */
    public static boolean checkSubAddress(String subAddress) {
        return StringUtils.isNotEmpty(subAddress);
    }

    /**
     * 校验接收者
     *
     * @param receiver 接收消息的用户id数组
     * @return true:合法 false:不合法
     */
    public static boolean checkReceiver(String[] receiver) {
        return ArrayUtils.isNotEmpty(receiver);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\utils\DateUtils.java
```java
package cn.xeblog.xechat.utils;

import org.apache.commons.lang3.time.DateFormatUtils;
import org.springframework.util.Assert;

import java.util.Date;

/**
 * 日期处理
 * @author yanpanyi
 * @date 2019/3/25
 */
public class DateUtils {

    /**
     * 格式化当前日期
     *
     * @param format 日期格式
     * @return 返回格式化后的日期字符串
     */
    public static String getDate(String format) {
        Assert.notNull(format, "日期格式不能为空");
        return DateFormatUtils.format(new Date(), format);
    }

    /**
     * 格式化指定时间戳
     *
     * @param timestamp 需要格式化的时间戳
     * @param format    日期格式
     * @return 返回格式化后的日期字符串
     */
    public static String getDate(long timestamp, String format) {
        Assert.state(timestamp >= 0, "时间戳不能为负数");
        Assert.notNull(format, "日期格式不能为空");
        return DateFormatUtils.format(timestamp, format);
    }

    /**
     * 格式化指定日期对象
     *
     * @param date   需要格式化的日期对象
     * @param format 日期格式
     * @return 返回格式化后的日期字符串
     */
    public static String getDate(Date date, String format) {
        Assert.notNull(date, "日期对象不能为空");
        Assert.notNull(format, "日期格式不能为空");
        return DateFormatUtils.format(date, format);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\utils\SensitiveWordNode.java
```java
package cn.xeblog.xechat.utils;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.HashMap;
import java.util.Map;

/**
 * 敏感词树节点
 *
 * @author yanpanyi
 * @date 2019/4/4
 */
@Getter
@Setter
@ToString
public class SensitiveWordNode {

    /**
     * 节点所代表的字符
     */
    private char key;

    /**
     * 节点的子节点
     */
    private Map<Character, SensitiveWordNode> nextNodes;

    /**
     * 该节点是否是最后一个
     */
    private boolean end;

    public SensitiveWordNode(char key) {
        this.key = key;
        this.nextNodes = new HashMap();
        this.end = false;
    }

    public SensitiveWordNode getNextNode(char key) {
        return nextNodes.get(key);
    }

    public void putNextNode(SensitiveWordNode node) {
        nextNodes.put(node.getKey(), node);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\utils\SensitiveWordUtils.java
```java
package cn.xeblog.xechat.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 敏感词处理
 *
 * @author yanpanyi
 * @date 2019/4/4
 */
@Slf4j
@Configuration
public class SensitiveWordUtils {

    private final static String[] LOVE_CHINA = {"富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国",
            "敬业", "诚信", "友善"};

    /**
     * 敏感词库
     */
    private static Set<String> keyWords;
    /**
     * 敏感词根节点
     */
    private static SensitiveWordNode rootNode;

    /**
     * 读取敏感词
     */
    private static void readSensitiveWords() {
        keyWords = new HashSet<>();
        BufferedReader reader = null;

        try {
            reader = new BufferedReader(new InputStreamReader(SensitiveWordUtils.class
                    .getResourceAsStream("/sensitive-word.txt"), "utf-8"));

            String line;
            while ((line = reader.readLine()) != null) {
                keyWords.add(line.trim());
            }
        } catch (Exception e) {
            log.error("读取敏感词库出现异常！ error -> {}", e);
        } finally {
            IOUtils.closeQuietly(reader);
        }
    }

    /**
     * 初始化敏感词库
     */
    private static void init() {
        if (rootNode != null) {
            return;
        }
        if (keyWords == null) {
            // 读取敏感词库
            readSensitiveWords();
            log.info("初始化敏感词库，共有{}个敏感词", keyWords.size());
        }

        // 初始化根节点
        rootNode = new SensitiveWordNode(' ');
        log.info("初始化敏感词节点");

        // 创建敏感词
        for (String keyWord : keyWords) {
            buildSensitiveWordNode(keyWord);
        }
    }

    /**
     * 构建敏感词节点
     *
     * @param keyWord
     */
    private static void buildSensitiveWordNode(String keyWord) {
        SensitiveWordNode nowNode = rootNode;

        for (Character c : keyWord.toCharArray()) {
            SensitiveWordNode nextNode = nowNode.getNextNode(c);
            if (nextNode == null) {
                nextNode = new SensitiveWordNode(c);
                nowNode.putNextNode(nextNode);
            }
            nowNode = nextNode;
        }
        nowNode.setEnd(true);
    }

    /**
     * 判断是否存在敏感词
     *
     * @param text
     * @return true:存在敏感词 false:未存在敏感词
     */
    public static boolean hasSensitiveWord(String text) {
        if (StringUtils.isEmpty(text)) {
            return false;
        }

        if (rootNode == null) {
            log.info("敏感词节点未被初始化！");
            return false;
        }

        // 清除非法字符
        text = invalidClear(text);
        StringBuilder sb = new StringBuilder();
        SensitiveWordNode nowNode;

        for (int i = 0; i < text.length(); i++) {
            nowNode = rootNode;
            for (int j = i; j < text.length(); j++) {
                nowNode = nowNode.getNextNode(text.charAt(j));
                if (nowNode == null) {
                    sb.setLength(0);
                    break;
                }

                sb.append(nowNode.getKey());

                if (nowNode.isEnd()) {
                    log.info("[{}] => 存在敏感词 -> {}", text, sb.toString());
                    return true;
                }
            }
        }

        return false;
    }

    @PostConstruct
    public void initData() {
        init();
    }

    /**
     * 热爱祖国，热爱人民
     *
     * @param text
     * @return 如果存在敏感词则返回处理后的结果，否则直接返回原内容
     */
    public static String loveChina(String text) {
        if (hasSensitiveWord(text)) {
            return LOVE_CHINA[(int) (Math.random() * LOVE_CHINA.length)];
        }

        return text;
    }

    /**
     * 清除非法字符
     *
     * @param str
     * @return 返回清除非法字符后的结果
     */
    private static String invalidClear(String str) {
        String regEx = "[`~!@#$%^&*()+=|{}':;,\\[\\].<>/?！￥…（）—【】｛｝｜／《》‘；：＋——＊&……％$＃@！～”“’。，、？·\\s\t\r\n]";
        Matcher m = Pattern.compile(regEx).matcher(str);
        return m.replaceAll("").trim();
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\utils\SpringUtils.java
```java
package cn.xeblog.xechat.utils;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * spring工具类
 *
 * @author yanpanyi
 * @date 2019/4/25
 */
@Component
public class SpringUtils implements ApplicationContextAware {

    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        SpringUtils.applicationContext = applicationContext;
    }

    /**
     * 通过类从spring上下文中获取bean
     *
     * @param cs
     * @param <T>
     * @return
     */
    public static <T> T getBean(Class<T> cs) {
        return applicationContext.getBean(cs);
    }
}

```

---

## 文件: xechat\src\main\java\cn\xeblog\xechat\utils\UUIDUtils.java
```java
package cn.xeblog.xechat.utils;

import java.util.UUID;

/**
 * uuid工具类
 *
 * @author yanpanyi
 * @date 2019/03/27
 */
public class UUIDUtils {

    /**
     * 生成uuid
     *
     * @return
     */
    public static String create() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}

```

---

## 文件: xechat\src\test\java\cn\xeblog\xechat\XechatApplicationTests.java
```java
package cn.xeblog.xechat;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
@Ignore
public class XechatApplicationTests {

    @Test
    public void contextLoads() {
    }

}

```

---

## 文件: xechat\src\test\java\cn\xeblog\xechat\service\impl\TuRingRobotServiceImplTest.java
```java
package cn.xeblog.xechat.service.impl;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import jakarta.annotation.Resource;

/**
 * @author yanpanyi
 * @date 2019/4/9
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@Ignore
public class TuRingRobotServiceImplTest {

    @Resource
    private TuRingRobotServiceImpl tuRingRobotService;

    @Test
    public void sendMessage() {
        System.out.println(tuRingRobotService.sendMessage("123456", "你长啥样"));
    }
}
```

---

## 文件: xechat\src\test\java\cn\xeblog\xechat\utils\DateUtilsTest.java
```java
package cn.xeblog.xechat.utils;

import cn.xeblog.xechat.constant.DateConstant;
import org.junit.Ignore;
import org.junit.Test;

/**
 * @author yanpanyi
 * @date 2019/4/23
 */
@Ignore
public class DateUtilsTest {

    @Test
    public void getDate() {
        System.out.println(DateUtils.getDate(DateConstant.SEND_TIME_FORMAT));
        System.out.println(DateUtils.getDate(System.currentTimeMillis(), DateConstant.SEND_TIME_FORMAT));
    }

}
```

---

## 文件: xechat\src\test\java\cn\xeblog\xechat\utils\SensitiveWordUtilsTest.java
```java
package cn.xeblog.xechat.utils;

import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

/**
 * @author yanpanyi
 * @date 2019/4/4
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@Ignore
public class SensitiveWordUtilsTest {

    @Test
    public void hasSensitiveWord() {
        Assert.assertTrue(SensitiveWordUtils.hasSensitiveWord("我们是共产主义接班人"));
        Assert.assertTrue(SensitiveWordUtils.hasSensitiveWord("中国的全称是中华人民共和国"));
        Assert.assertTrue(SensitiveWordUtils.hasSensitiveWord("我是一个合格的共产党员"));
        Assert.assertTrue(SensitiveWordUtils.hasSensitiveWord("我们在党中央的英明领导下生活越来越好了"));
        Assert.assertTrue(SensitiveWordUtils.hasSensitiveWord("热爱祖国，拥护中国共产党"));
        Assert.assertTrue(SensitiveWordUtils.hasSensitiveWord("cctv中央电视台正在播放新闻联播，庆祝中国共产党第十九次全国代表大会的顺利召开！"));
        Assert.assertFalse(SensitiveWordUtils.hasSensitiveWord("恭祝全球华人阖家欢乐！"));
        Assert.assertFalse(SensitiveWordUtils.hasSensitiveWord("人民代表大会制度是中国的根本政治制度，是中国人民民主专政政权的组织形式"));
    }

    @Test
    public void loveChina() {
        for (int i = 0; i < 100; i++) {
            System.out.println(SensitiveWordUtils.loveChina("中华"));
        }
    }
}
```

---

## 文件: xechat\src\test\java\cn\xeblog\xechat\utils\StringUtilsTest.java
```java
package cn.xeblog.xechat.utils;

import org.apache.commons.lang3.StringEscapeUtils;
import org.junit.Test;

/**
 * @author anlingyi
 * @date 2019/6/27
 */
public class StringUtilsTest {

    @Test
    public void stringEscapeUtils() {
        System.out.println(StringEscapeUtils.escapeHtml4("<h1>标题</h1>"));
        System.out.println(StringEscapeUtils.escapeHtml4("<script>alert(1);</script>"));
        System.out.println(StringEscapeUtils.escapeHtml4("#123 <<< >>> &nbsp;"));
    }
}

```

---

