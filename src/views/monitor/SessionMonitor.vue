<template>
    <div>
        <!-- 面包屑 -->
        <Breadcrumb :name="this.$route.name"/>

        <!-- table列表数据 -->
        <el-table
                :data="sessionData"
                v-loading="loading"
                style="width: 100%"
                row-key="id"
                border
        >
            <el-table-column
                    prop="id"
                    label="sessionId"
                    width="300"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    prop="account"
                    label="账号"
                    width="100">
            </el-table-column>
            <el-table-column
                    prop="ip"
                    label="ip"
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="os"
                    label="系统"
                    width="150"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    prop="browser"
                    label="浏览器"
                    width="150"
                    show-overflow-tooltip>
            </el-table-column>
            <el-table-column
                    prop="startTimestamp"
                    label="创建时间"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="lastAccessTime"
                    label="最后操作时间"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="expired"
                    label="状态"
                    width="100">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.expired? 'danger':'primary'"
                            disable-transitions>{{scope.row.expired?'过期':'正常'}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right">
                <template slot-scope="scope">
                    <el-button
                            size="mini"
                            type="danger"
                            @click="deleteSessiion(scope.row)">删除
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
                    :current-page.sync="pageNum"
                    @current-change="loadPage">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import Breadcrumb from "../../components/Breadcrumb";

    export default {
        name: "SessionMonitor",
        components: {
            Breadcrumb
        },
        data() {
            return {
                sessionData: [],
                loading: true,
                total: 0,
                pageNum: 1
            }
        },
        created() {
            this.loadSession();
        },
        methods: {
            /**
             * 加载session数据
             */
            loadSession() {
                this.$axios.get("monitor/session?pageNum=" + this.pageNum)
                    .then(res => {
                        this.loading = true;
                        if (!res.data.status) {
                            this.loading = false;
                            return;
                        }
                        this.sessionData = res.data.data;
                        this.total = parseInt(res.data.total);
                        this.loading = false;
                    })
            },
            /**
             * 分页查询
             * @param page
             */
            loadPage(page) {
                this.pageNum = page;
                this.loadSession();
            },
            /**
             * 删除session
             * @param session
             */
            deleteSessiion(session) {
                this.$confirm('此操作将删除session, 是否继续?', '提示', {
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.$axios.delete("/monitor/session/" + session.id)
                        .then(res => {
                            if (!res.data.status) {
                                return;
                            }
                            this.$message.success("删除成功");
                            // 重新加载table
                            this.loadSession();
                        })
                })
            }
        },
    }
</script>

<style scoped>

</style>