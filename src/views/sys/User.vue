<template>
  <div>
    <!-- 面包屑 -->
    <Breadcrumb :name="this.$route.name"/>

    <!-- 顶部操作 -->
    <div style="margin-bottom: 10px">
      <el-form inline size="small">
        <el-form-item label="搜索">
          <el-input v-model="search.account" placeholder="账号" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="search.phone" placeholder="手机号" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="search.isLock" placeholder="状态" clearable>
            <el-option label="锁定" value=true></el-option>
            <el-option label="正常" value=false></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-cascader v-model="search.deptId" :options="deptData" :props="deptProps" clearable
                       :show-all-levels="false" placeholder="部门"></el-cascader>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUser">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="show.add = true">添加</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- table列表数据 -->
    <el-table
        :data="userData"
        v-loading="loading"
        style="width: 100%"
        row-key="uid"
        border
    >
      <el-table-column
          prop="account"
          label="账号"
          width="120">
      </el-table-column>
      <el-table-column
          prop="phone"
          label="手机号"
          width="120">
      </el-table-column>
      <el-table-column
          prop="email"
          label="邮箱"
          width="180"
          show-overflow-tooltip>
      </el-table-column>
      <el-table-column
          prop="isLock"
          label="状态"
          width="80">
        <template slot-scope="scope">
          <el-tag @click="editLock(scope.row)"
                  :type="scope.row.isLock? 'danger' : 'primary'"
                  disable-transitions>{{ scope.row.isLock ? '锁定' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
          prop="deptId"
          label="部门"
          width="150"
          :formatter="deptFormatter">
      </el-table-column>
      <el-table-column
          prop="remarks"
          label="备注"
          width="250"
          show-overflow-tooltip>
      </el-table-column>
      <el-table-column
          prop="createTime"
          label="创建时间"
          width="160"
          :formatter="createTimeFormatter">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
              size="mini"
              @click="openEditRole(scope.row)">角色
          </el-button>
          <el-button
              size="mini"
              @click="openEditForm(scope.row)">编辑
          </el-button>
          <el-button
              size="mini"
              type="danger"
              @click="deleteUser(scope.row)">删除
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

    <!-- 关联角色的弹出框 -->
    <el-dialog title="角色" width="30%" center :visible.sync="show.editRole" @close="closeEditRole">
      <el-form :model="data.editRole" :rules="rules.editRole" ref="editRoleForm">
        <el-form-item prop="roleIds">
          <el-checkbox-group v-model="data.editRole.roleIds">
            <el-checkbox v-for="role in roleData" :key="role.id" :label="role.id">{{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editRole">修 改</el-button>
        <el-button @click="closeEditRole">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 添加用户的form弹出框 -->
    <el-dialog title="添加用户" width="30%" center :visible.sync="show.add" @close="show.add=false">
      <el-form :model="data.add" :rules="rules.add" ref="addForm" label-width="80px">
        <el-form-item label="账号" prop="account">
          <el-input v-model="data.add.account"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="data.add.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="data.add.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="data.add.email"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="data.add.remarks" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader v-model="data.add.deptId" :options="deptData" :props="deptProps" clearable
                       :show-all-levels="false" placeholder="请选择"></el-cascader>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="data.add.roleIds" multiple placeholder="请选择">
            <el-option
                v-for="role in roleData"
                :key="role.id"
                :label="role.name"
                :value="role.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addUser">添 加</el-button>
        <el-button @click="show.add = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改用户的form弹出框 -->
    <el-dialog title="修改用户" width="30%" center :visible.sync="show.edit" @close="show.edit=false">
      <el-tabs type="card" v-model="editTabs">
        <el-tab-pane label="修改用户" name="editTab">
          <el-form :model="data.edit" :rules="rules.edit" ref="editForm" label-width="80px">
            <el-form-item label="账号" prop="account">
              <el-input v-model="data.edit.account" disabled></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="data.edit.phone"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="data.edit.email"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="remarks">
              <el-input v-model="data.edit.remarks" type="textarea"></el-input>
            </el-form-item>
            <el-form-item label="部门" prop="deptId">
              <el-cascader v-model="data.edit.deptId" :options="deptData" :props="deptProps" clearable
                           :show-all-levels="false" placeholder="请选择"></el-cascader>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="editUser">修 改</el-button>
              <el-button @click="show.edit = false">关 闭</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="editPwdTab">
          <el-form :model="data.edit" :rules="rules.editPwd" ref="editPwdForm" label-width="80px">
            <el-form-item label="账号" prop="account">
              <el-input v-model="data.edit.account" disabled></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="data.edit.password" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="editPwd">修 改</el-button>
              <el-button @click="show.edit = false">关 闭</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

  </div>
</template>

<script>
import Breadcrumb from "../../components/Breadcrumb";

export default {
  name: "User",
  components: {
    Breadcrumb
  },
  data() {
    return {
      userData: [],  // 用户列表
      loading: true,
      total: 0,       // 用户组数据的总条数
      allDeptData: [], // 部门数据
      deptData: [],   // 部门递归数据
      roleData: [],   // 角色数据
      search: {       // 查询条件
        pageNum: 1,
        account: '',
        phone: '',
        isLock: '',
        deptId: '',

        asc: false,   // 排序
        column: "uid"
      },
      show: {      // 添加修改等是否显示
        add: false,
        edit: false,
        editRole: false,
      },
      data: {
        add: {
          account: null,
          password: null,
          phone: null,
          email: null,
          remarks: null,
          deptId: null,
          roleIds: [],
        },
        edit: {},
        editRole: {
          uid: null,
          roleIds: []     // 默认选中的roleId
        }
      },
      editTabs: 'editTab',   // 修改用户选项卡中默认选中的选项名称
      deptProps: {         // 顶部搜索栏中的部门显示格式
        checkStrictly: true,
        children: 'children',
        label: 'name',
        value: 'id',
      },
      rules: {
        add: {
          account: [
            {required: true, message: '请输入账号', trigger: 'blur'},
            {pattern: '^[a-zA-Z][a-zA-Z0-9]{3,9}$', message: '4 到 12 位的字母或数字(字母开头)', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
          ],
          phone: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {pattern: '^[1][3-9][0-9]{9}$', message: '手机号格式不正确', trigger: 'blur'}
          ],
          email: [
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          remarks: [
            {max: 200, message: '长度在 200 个字符'}
          ],
          roleIds: [
            {required: true, message: '请选择角色'},
          ]
        },
        edit: {
          phone: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {pattern: '^[1][3-9][0-9]{9}$', message: '手机号格式不正确', trigger: 'blur'}
          ],
          email: [
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          remarks: [
            {max: 200, message: '长度在 200 个字符'}
          ]
        },
        editPwd: {
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
          ],
        },
        editRole: {
          roleIds: [
            {required: true, message: '请选择角色', trigger: 'blur'},
          ]
        },
      }
    }
  },
  created() {
    this.loadDept();
    this.loadRole();
    this.loadUser();
  },
  methods: {
    /**
     * 加载用户
     */
    loadUser() {
      this.$axios.get("/sys/user", {
        params: this.search,
      }).then(res => {
        this.loading = true;
        if (!res.data.status) {
          this.loading = false;
          return;
        }
        this.userData = res.data.data;
        this.total = parseInt(res.data.total);
        this.loading = false;
      })
    },
    /**
     * 顶部搜索用户
     */
    searchUser() {
      if (this.search.deptId) {
        this.search.deptId = this.search.deptId[this.search.deptId.length - 1];
      }
      this.search.pageNum = 1;
      this.loadUser();
    },
    /**
     * 分页查询
     * @param page
     */
    loadPage(page) {
      this.search.pageNum = page;
      this.loadUser();
    },
    /**
     * 加载部门
     */
    loadDept() {
      this.$axios.get("/sys/dept")
          .then(res => {
            if (!res.data.status) {
              return;
            }
            let deptData = res.data.data;
            this.allDeptData = deptData;
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
          })
    },
    /**
     * 加载所有的角色
     */
    loadRole() {
      this.$axios.get("/sys/role/all")
          .then(res => {
            if (!res.data.status) {
              return;
            }
            this.roleData = res.data.data;
          })
    },
    /**
     * 打开角色弹出框
     * @param user
     */
    openEditRole(user) {
      // 获取关联的角色
      this.$axios.get("/sys/role/user/" + user.uid)
          .then(res => {
            if (!res.data.status) {
              return;
            }
            // 设置默认选中的节点
            this.data.editRole.roleIds = res.data.data;
          });
      this.data.editRole.uid = user.uid;
      this.show.editRole = true;
    },
    /**
     * 关闭角色弹出框
     */
    closeEditRole() {
      // 清空选中的角色，其他用户数据打开时不会因为数据加载慢先显示一次上一个用户的角色
      this.data.editRole.roleIds = [];
      // 清空校验
      this.$refs['editRoleForm'].clearValidate();
      this.show.editRole = false;
    },
    /**
     * 打开修改form弹出框
     */
    openEditForm(user) {
      // 克隆当前行的数据给form表单数据，直接使用 = 是引用传递，修改form中的数据，table中的数据会跟着改变
      this.data.edit = JSON.parse(JSON.stringify(user));
      this.show.edit = true;
    },
    /**
     * 添加用户
     */
    addUser() {
      let deptId = this.data.add.deptId;
      if (deptId) {
        this.data.add.deptId = deptId[deptId.length - 1];
      }
      this.$refs['addForm'].validate(valid => {
        if (!valid) {
          return false;
        }
        this.$axios.post("/sys/user", this.data.add)
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
              this.loadUser();
            })
      });
    },
    /**
     * 修改用户基础信息
     */
    editUser() {
      let deptId = this.data.edit.deptId;
      if (Array.isArray(deptId)) {
        this.data.edit.deptId = deptId[deptId.length - 1];
      }
      this.$refs['editForm'].validate(valid => {
        if (!valid) {
          return false;
        }
        this.$axios.put("/sys/user", this.data.edit)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("修改成功");
              // 隐藏修改的form
              this.show.edit = false;
              // 重新加载table
              this.loadUser();
            })
      })
    },
    /**
     * 删除用户
     */
    deleteUser(user) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        type: 'warning',
        center: true
      }).then(() => {
        this.$axios.delete("/sys/user/" + user.uid)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("删除成功");
              // 重新加载table
              this.loadUser();
            })
      })
    },
    /**
     * 修改关联的角色
     */
    editRole() {
      this.$refs['editRoleForm'].validate(valid => {
        if (!valid) {
          return false;
        }
        this.$axios.put("/sys/user/edit_role", this.data.editRole)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("修改成功");
              this.show.editRole = false;
              // 清空选中的角色
              this.data.editRole.roleIds = [];
            })
      });
    },
    /**
     * 修改用户锁定状态
     * @param user
     */
    editLock(user) {
      let msg = "";
      if (user.isLock) {
        msg = "此操作将启用账号, 是否继续?"
      } else {
        msg = "此操作将停用账号, 是否继续?";
      }
      this.$confirm(msg, '提示', {
        type: 'warning',
        center: true
      }).then(() => {
        let body = {};
        body.uid = user.uid;
        body.isLock = !user.isLock;
        this.$axios.put("/sys/user/edit_lock", body)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("修改成功");
              // 重新加载table
              this.loadUser();
            })
      })
    },
    /**
     * 修改用户密码
     */
    editPwd() {
      this.$refs['editPwdForm'].validate(valid => {
        if (!valid) {
          return false;
        }
        let body = {};
        body.uid = this.data.edit.uid;
        body.password = this.data.edit.password;
        this.$axios.put("/sys/user/edit_pwd", body)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("修改成功");
              this.show.edit = false;
            })
      });
    },
    /**
     * 创建时间格式化
     */
    createTimeFormatter(row, column, cellValue) {
      return this.$moment(parseInt(cellValue)).format("YYYY-MM-DD HH:mm:ss");
    },
    deptFormatter(row, column, cellValue) {
      let depts = this.allDeptData;
      for(let i in depts){
        if (depts[i].id === cellValue) {
          return depts[i].name;
        }
      }
      return "";
    }
  },
}
</script>

<style scoped>

</style>