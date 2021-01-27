<template>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-bottom: 10px;">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="name">{{name}}</el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script>
    export default {
        name: "Breadcrumb",
        props:{
            name: String
        }
    }
</script>

<style scoped>

</style>