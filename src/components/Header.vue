<template>
    <div>
        <div style="float: left">
            <el-link href="/index" type="primary" :underline="false"><h3>管理后台</h3></el-link>
        </div>
        <div style="float: right; margin-top: 10px;">
            <el-dropdown trigger="click" @command="clickDropDown">
                <span class="el-dropdown-link">
                    <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="changePwd">修改密码</el-dropdown-item>
                    <el-dropdown-item command="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <el-dialog title="修改密码" width="30%" center :visible.sync="changePwdFormShow">
            <el-form :model="changePwdData" :rules="changePwdRules" ref="changePwdForm">
                <el-form-item prop="oldPassword">
                    <el-input v-model="changePwdData.oldPassword" placeholder="旧密码" type="password"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="changePwdData.password" placeholder="新密码" type="password"></el-input>
                </el-form-item>
                <el-form-item prop="password2">
                    <el-input v-model="changePwdData.password2" placeholder="重复密码" type="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="changePwdFormShow = false">取 消</el-button>
                <el-button type="primary" @click="changePwd()">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Dropdown from 'element-ui';
    import Dialog from 'element-ui';

    Vue.use(Dropdown);
    Vue.use(Dialog);

    export default {
        name: "Header",
        data() {
            let validPwd2 = (rule, value, callback) => {
                if (value !== this.changePwdData.password) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                changePwdFormShow: false,      // 是否显示修改密码form框
                changePwdData: {
                    oldPassword: '',
                    password: '',
                    password2: '',
                },
                changePwdRules: {        // 修改密码表单校验
                    oldPassword: [
                        {required: true, message: '请输入旧密码'},
                        {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入新密码'},
                        {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
                    ],
                    password2: [
                        {required: true, message: '再次输入密码'},
                        {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'},
                        {validator: validPwd2, trigger: 'blur'}
                    ],
                }
            }
        },
        methods: {
            /**
             * 下拉框无法直接使用click事件，官方文档：点击指令
             * @param command
             */
            clickDropDown(command) {
                if (command === "logout") {
                    this.logout();
                } else if (command === "changePwd") {
                    this.changePwdFormShow = true;
                }
            },
            /**
             * 用户退出登录
             */
            logout() {
                this.$axios.get("/logout")
                    .then(res => {
                        if (res.data.status) {
                            this.$router.push("/login");
                        }
                    })
            },
            /**
             * 修改密码
             */
            changePwd() {
                // 校验
                this.$refs['changePwdForm'].validate(valid => {
                    if (!valid) {
                        return false;
                    }
                    this.$axios.put("/sys/user/change_pwd", this.changePwdData)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("修改成功");
                            this.$router.push("/login");
                        })
                });
            }
        }
    }
</script>

<style scoped>

</style>