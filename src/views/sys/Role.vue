<template>
    <div>
        <!-- 面包屑 -->
        <Breadcrumb :name="this.$route.name"/>

        <!-- 顶部操作 -->
        <div style="margin-bottom: 10px">
            <el-form inline size="small">
                <el-form-item label="搜索">
                    <el-input v-model="search.name" placeholder="角色名称" clearable></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="searchRole">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="show.add = true">添加</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- table列表数据 -->
        <el-table
                :data="roleData"
                v-loading="loading"
                style="width: 100%"
                row-key="roleId"
                border>
            <el-table-column
                    prop="name"
                    label="角色名称"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="roleChar"
                    label="角色字符"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="remarks"
                    label="备注"
                    width="300"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    prop="gmtCreate"
                    label="创建时间"
                    width="180"
                    :formatter="createTimeFormatter">
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="250">
                <template slot-scope="scope">
                    <el-button
                            size="mini"
                            @click="openEditRes(scope.row)">资源
                    </el-button>
                    <el-button
                            size="mini"
                            @click="openEditForm(scope.row)">编辑
                    </el-button>
                    <el-button
                            size="mini"
                            type="danger"
                            @click="deleteRole(scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div style="text-align: center">
            <el-pagination
                    background
                    layout="prev, pager, next"
                    :total="total"
                    :current-page.sync="search.pageNum"
                    @current-change="loadPage">
            </el-pagination>
        </div>

        <!-- 添加角色的form弹出框 -->
        <el-dialog title="添加角色" width="30%" center :visible.sync="show.add" @close="show.add=false">
            <el-form :model="data.add" :rules="rules.add" ref="addForm" label-width="80px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="data.add.name"></el-input>
                </el-form-item>
                <el-form-item label="角色字符" prop="resChar">
                    <el-input v-model="data.add.roleChar"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remarks">
                    <el-input v-model="data.add.remarks" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="资源" prop="resIds">
                    <el-tree
                            node-key="resId"
                            show-checkbox
                            ref="addResTree"
                            :data="resData"
                            :props="resTreeProps"
                    >
                    </el-tree>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addRole">添 加</el-button>
                <el-button @click="show.add = false">关 闭</el-button>
            </div>
        </el-dialog>

        <!-- 修改角色的form弹出框 -->
        <el-dialog title="修改角色" width="30%" center :visible.sync="show.edit" @close="show.edit=false">
            <el-form :model="data.edit" :rules="rules.edit" ref="editForm" label-width="80px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="data.edit.name"></el-input>
                </el-form-item>
                <el-form-item label="角色字符" prop="resChar">
                    <el-input v-model="data.edit.roleChar"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remarks">
                    <el-input v-model="data.edit.remarks" type="textarea"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="editRole">修 改</el-button>
                <el-button @click="show.edit = false">关 闭</el-button>
            </div>
        </el-dialog>

        <!-- 资源的弹出框 -->
        <el-dialog title="资源" width="30%" center :visible.sync="show.editRes" @close="closeResTree">
            <el-form :model="data.editRes" :rules="rules.editRes" ref="editResForm">
                <el-form-item prop="resIds">
                    <el-tree
                            node-key="resId"
                            show-checkbox
                            ref="editResTree"
                            :data="resData"
                            :default-checked-keys="data.editRes.resIds"
                            :props="resTreeProps"
                    >
                    </el-tree>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="editRes">修 改</el-button>
                <el-button @click="closeResTree">关 闭</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import Breadcrumb from "../../components/Breadcrumb";

    export default {
        name: "Role",
        components: {
            Breadcrumb
        },
        data() {
            return {
                roleData: [],   // 角色数据
                loading: true,
                resData: [],    // 资源数据,选择资源的显示
                total: 0,    // 角色的总条数，显示分页
                search: {       // 查询条件
                    name: '',   // 角色名查询
                    pageNum: 1,   // 分页条件, 默认一页10条

                    asc: false,   // 排序
                    column: "role_id"
                },
                show: {     // 添加修改的form显示
                    add: false,
                    edit: false,
                    editRes: false   // 控制编辑资源的弹出框显示
                },
                data: {         // 添加修改的数据
                    add: {
                        name: null,
                        roleChar: null,
                        remarks: null,
                        resIds: []
                    },
                    edit: {},
                    editRes: { // 修改关联资源的数据
                        roleId: null,
                        resIds: [] // 选中的资源id,弹出资源框时默认选中的数据
                    }
                },
                resTreeProps: {   // 资源数据的显示格式
                    children: 'children',
                    label: 'name',
                },
                rules: {         // 添加修改数据校验
                    add: {
                        name: [
                            {required: true, message: '请输入角色名称', trigger: 'blur'},
                            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
                        ],
                        roleChar: [
                            {max: 50, message: '长度在 20 个字符'}
                        ],
                        remarks: [
                            {max: 200, message: '长度在 200 个字符'}
                        ],
                        resIds: [
                            {required: true, message: '请选择资源', trigger: 'blur'},
                        ]
                    },
                    edit: {
                        name: [
                            {required: true, message: '请输入角色名称', trigger: 'blur'},
                            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
                        ],
                        roleChar: [
                            {max: 50, message: '长度在 20 个字符'}
                        ],
                        remarks: [
                            {max: 200, message: '长度在 200 个字符'}
                        ],
                    },
                    editRes: {
                        resIds: [
                            {required: true, message: '请选择资源', trigger: 'blur'},
                        ]
                    },
                },
            }
        },
        created() {
            this.loadRole();
            this.loadRes();
        },
        methods: {
            /**
             * 加载角色
             */
            loadRole() {
                this.$axios.get("/sys/role", {
                    params: this.search,
                }).then(res => {
                    this.loading = true;
                    if (!res.data.status) {
                        this.loading = false;
                        return;
                    }
                    this.roleData = res.data.data;
                    this.total = parseInt(res.data.total);
                    this.loading = false;
                })
            },
            /**
             * 查询分页数据
             * @param page
             */
            loadPage(page) {
                this.search.pageNum = page;
                this.loadRole();
            },
            /**
             * 顶部模糊查询
             */
            searchRole() {
                this.search.pageNum = 1;
                this.loadRole();
            },
            /**
             * 加载资源
             */
            loadRes() {
                this.$axios.get("/sys/res")
                    .then(res => {
                        if (!res.data.status) {
                            return;
                        }
                        let resData = res.data.data;
                        let parentRes = [];
                        resData.forEach(res => {
                            if (res.pid === "0") {
                                parentRes.push(res);
                            }
                        });
                        this.resData = this.$util.resTree(parentRes, resData);
                    })
            },
            /**
             * 添加角色
             */
            addRole() {
                let resTree = this.$refs['addResTree'];
                // 选中的节点
                let checkedResIds = resTree.getCheckedKeys();
                // 半选中的节点
                let checkedParentIds = resTree.getHalfCheckedKeys();
                this.data.add.resIds = checkedResIds.concat(checkedParentIds);

                this.$refs['addForm'].validate(valid => {
                    if (!valid) {
                        return false;
                    }
                    this.$axios.post("/sys/role", this.data.add)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("添加成功");
                            // 隐藏添加的form
                            this.show.add = false;
                            // 重置添加form中的数据，form-item中必须有prop属性才可以重置
                            this.$refs['addForm'].resetFields();
                            // 清空资源tree中的选中数据
                            this.$refs['addResTree'].setCheckedKeys([]);
                            // 重新加载table
                            this.loadRole();
                        })
                });
            },
            /**
             * 修改form显示
             * @param role
             */
            openEditForm(role) {
                // 克隆当前行的数据给form表单数据，直接使用 = 是引用传递，修改form中的数据，table中的数据会跟着改变
                this.data.edit = JSON.parse(JSON.stringify(role));
                this.show.edit = true;
            },
            /**
             * 修改角色
             */
            editRole() {
                this.$refs['editForm'].validate(valid => {
                    if (!valid) {
                        return false;
                    }
                    this.$axios.put("/sys/role", this.data.edit)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("修改成功");
                            // 隐藏添加资源的form
                            this.show.edit = false;
                            // 重新加载table
                            this.loadRole();
                        })
                })
            },
            /**
             * 打开角色关联资源的弹出框
             * @param role
             */
            openEditRes(role) {
                this.$axios.get("/sys/res/role/" + role.roleId)
                    .then(res => {
                        if (!res.data.status) {
                            return;
                        }
                        // 设置默认选中的节点
                        this.data.editRes.resIds = this.getCheckedIds(this.resData, res.data.data);
                    });
                this.data.editRes.roleId = role.roleId;
                this.show.editRes = true;
            },
            /**
             * 关闭角色关联资源的弹出框
             */
            closeResTree() {
                this.show.editRes = false;
                // 清空tree中的选中数据
                this.$refs['editResTree'].setCheckedKeys([]);
                // 清除校验
                this.$refs['editResForm'].clearValidate();
            },
            /**
             * 修改角色关联的资源
             */
            editRes() {
                let resTree = this.$refs['editResTree'];
                // 选中的节点
                let checkedResIds = resTree.getCheckedKeys();
                // 半选中的节点
                let checkedParentIds = resTree.getHalfCheckedKeys();
                this.data.editRes.resIds = checkedResIds.concat(checkedParentIds);

                this.$refs['editResForm'].validate(valid => {
                    if (!valid) {
                        return false;
                    }
                    this.$axios.put("/sys/role/edit_res", this.data.editRes)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("修改成功");
                            this.show.editRes = false;
                            // 清空tree中的选中数据
                            this.$refs['editResTree'].setCheckedKeys([]);
                        })
                });
            },
            /**
             * 删除角色
             * @param role
             */
            deleteRole(role) {
                this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$axios.delete("/sys/role/" + role.roleId)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("删除成功");
                            this.loadRole();
                        })
                }).catch(() => {
                    // do nothing
                });
            },
            /**
             * elementui的tree组件，选中父节点后默认所有字节也被选中。
             * 所以设置默认选中的数据时，只将所有的字节点选中，父节点默认变成半选中个
             *
             * @param resData 所有的资源数据
             * @param resIds 角色关联的资源id
             */
            getCheckedIds(resData, resIds) {
                let checkedIds = [];
                for (let i of resData) {
                    if (i.children && i.children.length > 0) {
                        let childArr = this.getCheckedIds(i.children, resIds);
                        checkedIds = checkedIds.concat(childArr);
                    } else {
                        for (let j of resIds) {
                            if (i.resId === j) {
                                checkedIds.push(i.resId);
                            }
                        }
                    }
                }
                return checkedIds;
            },
            /**
             * 创建时间格式化
             */
            createTimeFormatter(row, column, cellValue) {
                return this.$moment(parseInt(cellValue)).format("YYYY-MM-DD HH:mm:ss");
            },
        }
    }
</script>

<style scoped>

</style>