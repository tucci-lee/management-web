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
                    <el-input v-model="search.ip" placeholder="ip" clearable></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="search.status" placeholder="状态" clearable>
                        <el-option label="成功" value=true></el-option>
                        <el-option label="失败" value=false></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker
                            v-model="search.beginTime"
                            type="date"
                            value-format="timestamp"
                            placeholder="开始日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-date-picker
                            v-model="search.endTime"
                            type="date"
                            value-format="timestamp"
                            placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="searchLog">查询</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- table列表数据 -->
        <el-table
                :data="logData"
                v-loading="loading"
                style="width: 100%"
                row-key="id"
                border
        >
            <el-table-column
                    prop="account"
                    label="账号"
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="ip"
                    label="ip"
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="os"
                    label="系统"
                    width="180"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    prop="browser"
                    label="浏览器"
                    width="180"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    prop="status"
                    label="状态"
                    width="100">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status? 'primary':'danger'"
                            disable-transitions>{{scope.row.status?'成功':'失败'}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    prop="createTime"
                    label="创建时间"
                    width="180"
                    :formatter="createTimeFormatter">
            </el-table-column>
            <el-table-column
                    prop="msg"
                    label="信息"
                    width="300"
                    show-overflow-tooltip>
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
    </div>
</template>

<script>
    import Breadcrumb from "../../components/Breadcrumb";

    export default {
        name: "LoginLog",
        components: {
            Breadcrumb
        },
        data() {
            return {
                logData: [],
                loading: true,
                total: 0,
                search: {
                    account: '',
                    ip: '',
                    status: '',
                    beginTime: '',
                    endTime: '',

                    pageNum: 1,
                    asc: false,   // 排序
                    column: "id"
                }
            }
        },
        created() {
            this.loadLog();
        },
        methods: {
            /**
             * 加载登录日志数据
             */
            loadLog() {
                this.$axios.get("/log/login", {
                    params: this.search
                }).then(res => {
                    this.loading = true;
                    if (!res.data.status) {
                        this.loading = false;
                        return;
                    }
                    this.logData = res.data.data;
                    this.total = parseInt(res.data.total);
                    this.loading = false;
                })
            },
            /**
             * 查询日志
             */
            searchLog() {
                this.search.pageNum = 1;
                this.loadLog();
            },
            /**
             * 分页查询
             * @param page
             */
            loadPage(page) {
                this.search.pageNum = page;
                this.loadLog();
            },
            /**
             * 创建时间格式化
             */
            createTimeFormatter(row, column, cellValue) {
                return this.$moment(parseInt(cellValue)).format("YYYY-MM-DD HH:mm:ss");
            },
        },
    }
</script>

<style scoped>

</style>