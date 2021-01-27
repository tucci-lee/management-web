<template>
    <div style="padding-top: 10%">
        <el-form :model="loginData" class="loginBox" :rules="rules" ref="loginForm">
            <h3>登陆</h3>

            <el-form-item prop="username">
                <el-input v-model="loginData.username" placeholder="账号"></el-input>
            </el-form-item>

            <el-form-item prop="password">
                <el-input v-model="loginData.password" placeholder="密码" type="password"></el-input>
            </el-form-item>

            <el-row>
                <el-col :span="14">
                    <el-form-item prop="code">
                        <el-input v-model="loginData.code" placeholder="图形验证码"
                                  @keyup.enter.native="login()"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="10" class="codebox">
                    <img :src="codeimg" @click="refreshCodeimg()"/>
                </el-col>
            </el-row>

            <el-form-item style="text-align: left">
                <el-checkbox v-model="loginData.rememberMe">免登陆</el-checkbox>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width:100%;" @click="login()">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    export default {
        name: "Login",
        data() {
            return {
                loginData: {         // 登陆from表单数据
                    username: '',       // 账号
                    password: '',       // 密码
                    code: '',           // 验证码
                    rememberMe: false,  //是否记住我
                },
                codeimg: '',    // 验证码图片路径
                rules: {        // 表单校验
                    username: [
                        {required: true, message: '请输入账号', trigger: 'blur'},
                        {pattern: '^[a-zA-Z][a-zA-Z0-9]{3,9}$', message: '账号必须 4 到 12 位的字母或数字(字母开头)', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
                    ],
                    code: [{required: true, message: '请输入验证码', trigger: 'blur'}]
                }
            }
        },
        created() {
            this.isLogin();
            this.refreshCodeimg();
        },
        methods: {
            /**
             * 刷新验证码图片
             */
            refreshCodeimg() {
                this.codeimg = this.$axios.defaults.baseURL + '/code/img?' + Math.random();
            },
            /**
             * 登陆
             */
            login() {
                // 校验
                this.$refs['loginForm'].validate(valid => {
                    if (!valid) {
                        return false;
                    }
                    // 登陆请求
                    this.$axios.post("/login", this.loginData)
                        .then(res => {
                            if (res.data.status) {
                                this.$router.push("/");
                            } else {
                                this.refreshCodeimg();
                            }
                        })
                });
            },
            /**
             * 是否登陆过
             */
            isLogin() {
                this.$axios.get("/is_login").then(res => {
                    if (res.data.status) {
                        this.$router.push("/index");
                    }
                });
            }
        }
    }
</script>

<style scoped>

    .loginBox {
        border-radius: 10px;
        margin: 0 auto;
        width: 350px;
        padding: 30px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
    }

    .codebox {
        text-align: right;
    }

</style>