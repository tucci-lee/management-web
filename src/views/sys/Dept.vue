<template>
    <div>
        <!-- 面包屑 -->
        <Breadcrumb :name="this.$route.name"/>

        <!-- 添加按钮 -->
        <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="show.add = true">添加</el-button>
        </div>

        <!-- table列表数据 -->
        <el-table
                :data="deptData"
                v-loading="loading"
                style="width: 100%"
                row-key="deptId"
                border
                :tree-props="{children: 'children'}">
            <el-table-column
                    prop="name"
                    label="部门名称"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="seq"
                    label="排序"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="gmtCreate"
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
                            @click="deleteDept(scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加的form弹出框 -->
        <el-dialog title="添加部门" width="30%" center :visible.sync="show.add" @close="show.add=false">
            <el-form :model="data.add" :rules="rules" ref="addForm" label-width="80px">
                <el-form-item label="上级部门" prop="pid">
                    <el-cascader v-model="data.add.pid" :options="deptData" :props="deptProps" clearable
                                 placeholder="不选默认为顶级部门"></el-cascader>
                </el-form-item>
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="data.add.name"></el-input>
                </el-form-item>
                <el-form-item label="排序" prop="seq">
                    <el-input v-model="data.add.seq" type="number"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addDept()">添 加</el-button>
                <el-button @click="show.add = false">关 闭</el-button>
            </div>
        </el-dialog>

        <!-- 修改的form弹出框 -->
        <el-dialog title="修改部门" width="30%" center :visible.sync="show.edit" @close="show.edit=false">
            <el-form :model="data.edit" :rules="rules" ref="editForm" label-width="80px">
                <el-form-item label="上级部门" prop="pid">
                    <el-cascader v-model="data.edit.pid" :options="deptData" :props="deptProps" clearable
                                 placeholder="不选默认为顶级部门"></el-cascader>
                </el-form-item>
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="data.edit.name"></el-input>
                </el-form-item>
                <el-form-item label="排序" prop="seq">
                    <el-input v-model="data.edit.seq" type="number"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="editDept()">修 改</el-button>
                <el-button @click="show.edit = false">关 闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Breadcrumb from "../../components/Breadcrumb";

    export default {
        name: "Dept",
        components: {
            Breadcrumb
        },
        data() {
            return {
                deptData: [],        // 部门数据
                loading: true,      // 加载图
                show: {             // 添加、修改dialog是否显示
                    add: false,
                    edit: false,
                },
                deptProps: {         // 添加、修改form中的上级部门显示格式
                    checkStrictly: true,
                    children: 'children',
                    label: 'name',
                    value: 'deptId',
                },
                data: {           // 添加、修改资源的数据
                    add: {
                        pid: null,
                        name: null,
                        seq: null,
                    },
                    edit: {}
                },
                rules: {          // 添加、修改的校验
                    name: [
                        {required: true, message: '请输入部门名称', trigger: 'blur'},
                        {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
                    ],
                }
            }
        },
        created() {
            this.loadDept();
        },
        methods: {
            /**
             * 加载部门列表
             */
            loadDept() {
                this.$axios.get("/sys/dept")
                    .then(res => {
                        this.loading = true;
                        if (!res.data.status) {
                            this.loading = false;
                            return;
                        }
                        let deptData = res.data.data;
                        if (deptData.length === 0) {
                            return;
                        }
                        let parentDept = [];
                        deptData.forEach(dept => {
                            if (dept.pid === "0") {
                                parentDept.push(dept);
                            }
                        });
                        this.deptData = this.$util.resTree(parentDept, deptData);
                        this.loading = false;
                    })
            },
            /**
             * 添加资源
             */
            addDept() {
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

                    this.$axios.post("/sys/dept", this.data.add)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("添加成功");
                            // 隐藏添加的form
                            this.show.add = false;
                            // 重置添加form中的数据，form-item中必须有prop属性才可以重置
                            this.$refs['addForm'].resetFields();
                            // 重新加载table
                            this.loadDept();
                        });
                });
            },
            /**
             * 修改form显示
             * @param dept
             */
            openEditForm(dept) {
                // 克隆当前行的数据给form表单数据，直接使用 =res 是引用传递，修改form中的数据，table中的数据会跟着改变
                this.data.edit = JSON.parse(JSON.stringify(dept));
                this.show.edit = true;
            },
            /**
             * 修改
             */
            editDept() {
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

                    if (this.data.edit.pid === this.data.edit.deptId) {
                        this.$message.error("部门上级不可以是当前部门");
                        return;
                    }

                    this.$axios.put("/sys/dept", this.data.edit)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("修改成功");
                            // 隐藏修改的form
                            this.show.edit = false;
                            // 重新加载table
                            this.loadDept();
                        })
                });
            },
            /**
             * 删除
             * @param dept
             */
            deleteDept(dept) {
                this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$axios.delete("/sys/dept/" + dept.deptId)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("删除成功");
                            // 重新加载table
                            this.loadDept();
                        })
                }).catch(() => {
                    // do nothing
                });
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