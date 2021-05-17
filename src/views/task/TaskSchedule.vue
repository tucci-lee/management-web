<template>
  <div>
    <!-- 面包屑 -->
    <Breadcrumb :name="this.$route.name"/>

    <!-- 顶部操作 -->
    <div style="margin-bottom: 10px">
      <el-form inline size="small">
        <el-form-item label="搜索">
          <el-input v-model="search.name" placeholder="名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="search.type" placeholder="类型" clearable>
            <el-option label="系统启动" value=1></el-option>
            <el-option label="手动启动" value=2></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="search.status" placeholder="状态" clearable>
            <el-option label="启动" value=1></el-option>
            <el-option label="停止" value=2></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchData">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="show.add = true">添加</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- table列表数据 -->
    <el-table
        :data="taskData"
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        border>
      <el-table-column
          prop="name"
          label="任务名称"
          width="150"
          show-overflow-tooltip>
      </el-table-column>
      <el-table-column
          prop="className"
          label="任务类名"
          width="180"
          show-overflow-tooltip>
      </el-table-column>
      <el-table-column
          prop="cron"
          label="cron"
          width="180"
          show-overflow-tooltip>
      </el-table-column>
      <el-table-column
          prop="type"
          label="类型"
          width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === 1? 'primary' : 'info'"
                  disable-transitions>{{ scope.row.type === 1 ? '系统' : '手动' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
          prop="status"
          label="状态"
          width="80">
        <template slot-scope="scope">
          <el-tag @click="editStatus(scope.row)"
                  :type="scope.row.status ? 'primary' : 'info'"
                  disable-transitions>{{ scope.row.status ? '启动' : '停止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
          prop="remarks"
          label="备注"
          width="200"
          show-overflow-tooltip>
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
              type="success"
              @click="openStartLog(scope.row)">启动日志
          </el-button>
          <el-button
              size="mini"
              type="success"
              @click="openRunLog(scope.row)">运行日志
          </el-button>
          <el-button
              size="mini"
              @click="openEditForm(scope.row)">编辑
          </el-button>
          <el-button
              size="mini"
              type="danger"
              @click="deleteData(scope.row)">删除
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
          @current-change="loadData">
      </el-pagination>
    </div>

    <!-- 添加任务的form弹出框 -->
    <el-dialog title="添加任务" width="30%" center :visible.sync="show.add" @close="show.add=false">
      <el-form :model="data.add" :rules="rules" ref="addForm" label-width="80px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="data.add.name"></el-input>
        </el-form-item>
        <el-form-item label="任务类名" prop="className">
          <el-input v-model="data.add.className"></el-input>
        </el-form-item>
        <el-form-item label="cron" prop="cron">
          <el-input v-model="data.add.cron"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-radio v-model="data.add.type" label=1>系统</el-radio>
          <el-radio v-model="data.add.type" label=2>手动</el-radio>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="data.add.remarks" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addData()">添 加</el-button>
        <el-button @click="show.add = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改任务的form弹出框 -->
    <el-dialog title="修改任务" width="30%" center :visible.sync="show.edit" @close="show.edit=false">
      <el-form :model="data.edit" :rules="rules" ref="editForm" label-width="80px">

        <el-form-item label="任务名称" prop="name">
          <el-input v-model="data.edit.name"></el-input>
        </el-form-item>
        <el-form-item label="任务类名" prop="className">
          <el-input v-model="data.edit.className"></el-input>
        </el-form-item>
        <el-form-item label="cron" prop="cron">
          <el-input v-model="data.edit.cron"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-radio v-model="data.edit.type" :label=1>系统</el-radio>
          <el-radio v-model="data.edit.type" :label=2>手动</el-radio>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="data.edit.remarks" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editData()">修 改</el-button>
        <el-button @click="show.edit = false">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="启动日志" width="40%" center :visible.sync="show.startLog" @close="show.startLog=false">
      <el-table :data="startLog.data"
                v-loading="loading"
                row-key="id"
                border>
        <el-table-column property="account" label="启动人" width="150"></el-table-column>
        <el-table-column property="status" label="启动状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status ? 'primary' : 'danger'"
                    disable-transitions>{{ scope.row.status ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column property="createTime" label="启动时间" width="180" :formatter="createTimeFormatter"></el-table-column>
        <el-table-column property="msg" label="启动信息" show-overflow-tooltip></el-table-column>
      </el-table>
      <div style="text-align: center">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="startLog.total"
            :current-page.sync="startLog.search.pageNum"
            @current-change="loadStartLog()">
        </el-pagination>
      </div>
    </el-dialog>

    <el-dialog title="运行日志" width="40%" center :visible.sync="show.runLog" @close="show.runLog=false">
      <el-table :data="runLog.data"
                v-loading="loading"
                row-key="id"
                border>
        <el-table-column property="status" label="运行状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status ? 'primary' : 'danger'"
                    disable-transitions>{{ scope.row.status ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column property="runTime" label="执行时间/ms" width="120"></el-table-column>
        <el-table-column property="createTime" label="运行时间" width="180" :formatter="createTimeFormatter"></el-table-column>
        <el-table-column property="msg" label="运行信息" show-overflow-tooltip></el-table-column>
      </el-table>
      <div style="text-align: center">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="runLog.total"
            :current-page.sync="runLog.search.pageNum"
            @current-change="loadRunData()">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from "../../components/Breadcrumb";

export default {
  name: "TaskSchedule",
  components: {
    Breadcrumb
  },
  data() {
    return {
      taskData: [],   // table数据
      loading: true,
      total: 0,    // 数据的总条数，显示分页
      search: {       // 查询条件
        name: '',   // 名称
        type: '',   // 类型
        status: '', // 状态

        pageNum: 1,   // 分页条件, 默认一页10条
        asc: false,   // 排序
        column: "id"
      },
      startLog: { // 启动日志
        data: [],
        total: 0,
        search: {
          taskId: null,
          pageNum: 1,
          asc: false,   // 排序
          column: "id"
        }
      },
      runLog: { //运行日志
        data: [],
        total: 0,
        search: {
          taskId: null,
          pageNum: 1,
          asc: false,   // 排序
          column: "id"
        }
      },
      show: {     // 添加修改的form显示
        add: false,
        edit: false,
        startLog: false,
        runLog: false,
      },
      data: {         // 添加修改的数据
        add: {
          name: null,
          className: null,
          cron: null,
          type: null,
          remarks: null,
        },
        edit: {},
      },
      rules: {         // 添加修改数据校验
        name: [
          {required: true, message: '请输入任务名称', trigger: 'blur'},
          {max: 20, message: '长度在 20 个字符', trigger: 'blur'}
        ],
        className: [
          {required: true, message: '请输入任务类名', trigger: 'blur'},
          {max: 100, message: '长度在 100 个字符', trigger: 'blur'}
        ],
        cron: [
          {required: true, message: '请输入cron', trigger: 'blur'},
          {max: 50, message: '长度在 50 个字符', trigger: 'blur'}
        ],
        type: [
          {required: true, message: '请输入任务类型', trigger: 'blur'},
        ],
        remarks: [
          {max: 200, message: '长度在 200 个字符'}
        ],
      },
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    /** 加载任务 */
    loadData() {
      this.$axios.get("/task/schedule", {
        params: this.search,
      }).then(res => {
        this.loading = true;
        if (!res.data.status) {
          this.loading = false;
          return;
        }
        this.taskData = res.data.data;
        this.total = parseInt(res.data.total);
        this.loading = false;
      })
    },
    /** 查询分页数据 */
    loadPage(page) {
      this.search.pageNum = page;
      this.loadData();
    },
    /** 顶部模糊查询 */
    searchData() {
      this.search.pageNum = 1;
      this.loadData();
    },
    /** 添加任务 */
    addData() {
      this.$refs['addForm'].validate(valid => {
        if (!valid) {
          return false;
        }
        this.$axios.post("/task/schedule", this.data.add)
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
              this.loadData();
            })
      });
    },
    /** 修改form显示 */
    openEditForm(data) {
      // 克隆当前行的数据给form表单数据，直接使用 = 是引用传递，修改form中的数据，table中的数据会跟着改变
      this.data.edit = JSON.parse(JSON.stringify(data));
      this.show.edit = true;
    },
    /** 修改数据 */
    editData() {
      this.$refs['editForm'].validate(valid => {
        if (!valid) {
          return false;
        }
        this.$axios.put("/task/schedule", this.data.edit)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("修改成功");
              // 隐藏添加资源的form
              this.show.edit = false;
              // 重新加载table
              this.loadData();
            })
      })
    },
    /** 编辑任务启动状态 */
    editStatus(task) {
      let msg = "";
      if (!task.status) {
        msg = "此操作将开启任务, 是否继续?"
      } else {
        msg = "此操作将停止任务, 是否继续?";
      }
      this.$confirm(msg, '提示', {
        type: 'warning',
        center: true
      }).then(() => {
        let body = {};
        body.id = task.id;
        body.status = !task.status;
        this.$axios.put("/task/schedule/edit_status", body)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("修改成功");
              // 重新加载table
              this.loadData();
            })
      })
    },
    /** 删除数据 */
    deleteData(data) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        type: 'warning',
        center: true
      }).then(() => {
        this.$axios.delete("/task/schedule/" + data.id)
            .then(res => {
              if (!res.data.status) {
                return;
              }
              this.$message.success("删除成功");
              this.loadData();
            })
      })
    },
    /** 打开启动日志 */
    openStartLog(data) {
      this.startLog.search.taskId = data.id;
      this.loadStartLog();
      this.show.startLog = true;
    },
    loadStartLog() {
      this.$axios.get("/task/schedule/start/log", {
        params: this.startLog.search,
      }).then(res => {
        this.loading = true;
        if (!res.data.status) {
          this.loading = false;
          return;
        }
        this.startLog.data = res.data.data;
        this.startLog.total = parseInt(res.data.total);
        this.loading = false;
      });
    },
    /** 打开运行日志 */
    openRunLog(data) {
      this.runLog.search.taskId = data.id;
      this.loadRunData();
      this.show.runLog = true;
    },
    loadRunData() {
      this.$axios.get("/task/schedule/run/log", {
        params: this.runLog.search,
      }).then(res => {
        this.loading = true;
        if (!res.data.status) {
          this.loading = false;
          return;
        }
        this.runLog.data = res.data.data;
        this.runLog.total = parseInt(res.data.total);
        this.loading = false;
      });
    },
    /** 创建时间格式化 */
    createTimeFormatter(row, column, cellValue) {
      return this.$moment(parseInt(cellValue)).format("YYYY-MM-DD HH:mm:ss");
    },
  }
}
</script>

<style scoped>

</style>