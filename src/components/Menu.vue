<template>
    <div>
        <el-menu router
                 background-color="#545c64"
                 text-color="#fff"
                 active-text-color="#ffd04b">
            <el-submenu v-for="menu in menus" :key="menu.id" :index="menu.url?menu.url:menu.id">
                <template slot="title">
                    <i :class="menu.icon"></i>
                    <span>{{menu.name}}</span>
                </template>
                <el-menu-item v-for="cmenu in menu.children" :key="cmenu.id" :index="cmenu.url">
                    <i :class="cmenu.icon"></i>
                    <span slot="title">{{cmenu.name}}</span>
                </el-menu-item>
            </el-submenu>
        </el-menu>
    </div>
</template>

<script>
    export default {
        name: "Menu",
        data() {
            return {
                menus: []
            }
        },
        created() {
            this.loadMenus();
        },
        methods: {
            /**
             * 加载菜单
             */
            loadMenus() {
                this.$axios.get("/sys/res/owned_menus")
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
            },

        }
    }
</script>

<style scoped>

</style>