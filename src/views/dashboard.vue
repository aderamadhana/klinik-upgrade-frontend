<template>
  <div>
    <!-- PAGE HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Overview sistem klinik</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbs: [{ title: "Dashboard", disabled: true }],
    };
  },
};
</script>
