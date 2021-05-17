<template>
    <div>
        <!-- 面包屑 -->
        <Breadcrumb :name="this.$route.name"/>

        <!-- 添加资源的按钮 -->
        <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="openAddForm()">添加</el-button>
        </div>

        <!-- table列表数据 -->
        <el-table
                :data="resData"
                v-loading="loading"
                style="width: 100%"
                row-key="id"
                border
                :tree-props="{children: 'children'}">
            <el-table-column
                    prop="name"
                    label="资源名称"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="type"
                    label="类型"
                    width="80"
                    :formatter="resTypeFormatter">
            </el-table-column>
            <el-table-column
                    prop="url"
                    label="url"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="resChar"
                    label="权限字符"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="seq"
                    label="排序"
                    width="80">
            </el-table-column>
            <el-table-column
                    prop="createTime"
                    label="创建时间"
                    width="180"
                    :formatter="createTimeFormatter">
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button
                            size="mini"
                            @click="openEditForm(scope.row)">编辑
                    </el-button>
                    <el-button
                            size="mini"
                            type="danger"
                            @click="deleteRes(scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加资源的form弹出框 -->
        <el-dialog title="添加资源" width="30%" center :visible.sync="show.add" @close="show.add=false">
            <el-form :model="data.add" :rules="rules.add" ref="addForm" label-width="80px">
                <el-form-item label="上级资源" prop="pid">
                    <el-cascader v-model="data.add.pid" :options="menus" :props="menuProps" clearable
                                 placeholder="不选默认为顶级目录"></el-cascader>
                </el-form-item>
                <el-form-item label="资源名称" prop="name">
                    <el-input v-model="data.add.name"></el-input>
                </el-form-item>
                <el-form-item label="资源类型" prop="type">
                    <el-radio v-model="data.add.type" label="1">菜单</el-radio>
                    <el-radio v-model="data.add.type" label="2">权限</el-radio>
                </el-form-item>
                <el-form-item label="url" prop="url">
                    <el-input v-model="data.add.url"></el-input>
                </el-form-item>
                <el-form-item label="资源字符" prop="resChar">
                    <el-input v-model="data.add.resChar"></el-input>
                </el-form-item>
                <el-form-item label="图标" prop="icon">
                    <el-input v-model="data.add.icon"></el-input>
                </el-form-item>
                <el-form-item label="排序" prop="seq">
                    <el-input v-model="data.add.seq" type="number"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addRes()">添 加</el-button>
                <el-button @click="show.add = false">关 闭</el-button>
            </div>
        </el-dialog>

        <!-- 修改资源的form弹出框 -->
        <el-dialog title="修改资源" width="30%" center :visible.sync="show.edit" @close="show.edit=false">
            <el-form :model="data.edit" :rules="rules.edit" ref="editForm" label-width="80px">
                <el-form-item label="上级资源" prop="pid">
                    <el-cascader v-model="data.edit.pid" :options="menus" :props="menuProps" clearable
                                 placeholder="不选默认为顶级目录"></el-cascader>
                </el-form-item>
                <el-form-item label="资源名称" prop="name">
                    <el-input v-model="data.edit.name"></el-input>
                </el-form-item>
                <el-form-item label="资源类型" prop="type">
                    <el-radio v-model="data.edit.type" :label="1" disabled>菜单</el-radio>
                    <el-radio v-model="data.edit.type" :label="2" disabled>权限</el-radio>
                </el-form-item>
                <el-form-item label="url" prop="url">
                    <el-input v-model="data.edit.url"></el-input>
                </el-form-item>
                <el-form-item label="资源字符" prop="resChar">
                    <el-input v-model="data.edit.resChar"></el-input>
                </el-form-item>
                <el-form-item label="图标" prop="icon">
                    <el-input v-model="data.edit.icon"></el-input>
                </el-form-item>
                <el-form-item label="排序" prop="seq">
                    <el-input v-model="data.edit.seq" type="number"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="editRes()">修 改</el-button>
                <el-button @click="show.edit = false">关 闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Breadcrumb from "../../components/Breadcrumb";

    export default {
        name: "Resource",
        components: {
            Breadcrumb
        },
        data() {
            return {
                resData: [],        // 资源数据
                loading: true,
                menus: [],          // 菜单数据，添加修改资源时下拉选中的上级资源，动态加载：打开添加或修改时才加载
                show: {          // 资源添加、修改dialog是否显示
                    add: false,
                    edit: false,
                },
                menuProps: {         // 添加、修改form中的上级资源显示格式
                    checkStrictly: true,
                    children: 'children',
                    label: 'name',
                    value: 'id',
                },
                data: {           // 添加、修改资源的数据
                    add: {
                        pid: null,
                        name: null,
                        type: null,
                        url: null,
                        resChar: null,
                        icon: null,
                        seq: null,
                    },
                    edit: {}
                },
                rules: {          // 添加、修改资源的校验
                    add: {
                        name: [
                            {required: true, message: '请输入资源名称', trigger: 'blur'},
                            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
                        ],
                        type: [
                            {required: true, message: '请输入资源类型'},
                        ],
                        url: [
                            {max: 100, message: '长度在 100 个字符'}
                        ],
                        resChar: [
                            {max: 50, message: '长度在 20 个字符'}
                        ],
                        icon: [
                            {max: 100, message: '长度在 100 个字符'}
                        ]
                    },
                    edit: {
                        name: [
                            {required: true, message: '请输入资源名称', trigger: 'blur'},
                            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
                        ],
                        url: [
                            {max: 100, message: '长度在 100 个字符'}
                        ],
                        resChar: [
                            {max: 50, message: '长度在 20 个字符'}
                        ],
                        icon: [
                            {max: 100, message: '长度在 100 个字符'}
                        ]
                    }
                }
            }
        },
        created() {
            this.loadRes();
        },
        methods: {
            /**
             * 加载资源列表
             */
            loadRes() {
                this.$axios.get("/sys/res")
                    .then(res => {
                        this.loading = true;
                        if (!res.data.status) {
                            this.loading = false;
                            return;
                        }
                        let resData = res.data.data;
                        if (resData.length === 0) {
                            return;
                        }
                        let parentRes = [];
                        resData.forEach(res => {
                            if (res.pid === "0") {
                                parentRes.push(res);
                            }
                        });
                        this.resData = this.$util.resTree(parentRes, resData);
                        this.loading = false;
                    })
            },
            /**
             * 如果this.menus是空，则加载所有菜单
             */
            loadMenus() {
                if (this.menus.length === 0) {
                    this.$axios.get("/sys/res/menus")
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            let menuData = res.data.data;
                            if (menuData.length === 0) {
                                return;
                            }
                            // 获取所有顶级菜单
                            let parentMenus = [];
                            menuData.forEach(menu => {
                                if (menu.pid === "0") {
                                    parentMenus.push(menu);
                                }
                            });
                            // 递归加载菜单树结构
                            this.menus = this.$util.resTree(parentMenus, menuData);
                        })
                }
            },
            /**
             * 打开添加资源的form
             */
            openAddForm() {
                this.show.add = true;
                this.loadMenus();
            },
            /**
             * 添加资源
             */
            addRes() {
                this.$refs['addForm'].validate(valid => {
                    if (!valid) {
                        return false;
                    }
                    // 设置pid，cascader组件返回的是一个数组，包含所有父级，只取最后一级
                    let pid = this.data.add.pid;
                    if (pid) {
                        this.data.add.pid = pid[pid.length - 1];
                    } else {
                        this.data.add.pid = 0;
                    }

                    this.$axios.post("/sys/res", this.data.add)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("添加成功");
                            // 隐藏添加资源的form
                            this.show.add = false;
                            // 重置添加资源form中的数据，form-item中必须有prop属性才可以重置
                            this.$refs['addForm'].resetFields();
                            // 重新加载table
                            this.loadRes();
                            // 清空添加修改资源时下拉选的菜单数据
                            this.menus = [];
                        });
                });
            },
            /**
             * 修改form显示
             * @param res
             */
            openEditForm(res) {
                this.loadMenus();
                // 克隆当前行的数据给form表单数据，直接使用 =res 是引用传递，修改form中的数据，table中的数据会跟着改变
                this.data.edit = JSON.parse(JSON.stringify(res));
                this.show.edit = true;
            },
            /**
             * 修改资源
             */
            editRes() {
                this.$refs['editForm'].validate(valid => {
                    if (!valid) {
                        return false;
                    }

                    let pid = this.data.edit.pid;
                    if (Array.isArray(pid)) {
                        if (pid.length) {
                            this.data.edit.pid = pid[pid.length - 1];
                        } else {
                            this.data.edit.pid = 0;
                        }
                    }
                    if (this.data.edit.pid === this.data.edit.id) {
                        this.$message.error("资源上级不可以是当前资源");
                        return;
                    }
                    this.$axios.put("/sys/res", this.data.edit)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("修改成功");
                            // 隐藏添加资源的form
                            this.show.edit = false;
                            // 重新加载table
                            this.loadRes();
                            // 清空添加修改资源时下拉选的菜单数据
                            this.menus = [];
                        })
                });
            },
            /**
             * 删除资源
             * @param resource
             */
            deleteRes(resource) {
                this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$axios.delete("/sys/res/" + resource.id)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("删除成功");
                            // 重新加载table
                            this.loadRes();
                            // 清空添加修改资源时下拉选的菜单数据
                            this.menus = [];
                        })
                })
            },
            /**
             * 格式化资源类型
             *
             * @returns {string}
             */
            resTypeFormatter(row, column, cellValue) {
                if (cellValue === 1) {
                    return "菜单";
                } else {
                    return "权限";
                }
            },
            /**
             * 创建时间格式化
             */
            createTimeFormatter(row, column, cellValue) {
                return this.$moment(parseInt(cellValue)).format("YYYY-MM-DD HH:mm:ss");
            }
        }
    }
</script>

<style scoped>

</style>