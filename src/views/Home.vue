<template>
    <el-container style="height: 100%">
        <el-header style="background-color: #545c64">
            <Header/>
        </el-header>
        <el-container>
            <el-aside width="200px" style="background-color: #545c64">
                <Menu/>
            </el-aside>
            <el-main>
                <router-view/>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import Header from "../components/Header";
    import Menu from "../components/Menu";

    export default {
        name: "Home",
        components: {
            Header, Menu
        },
        created() {}
    }
</script>

<style scoped>

</style>