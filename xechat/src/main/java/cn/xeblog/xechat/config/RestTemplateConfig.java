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