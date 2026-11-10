<script setup>
import { reactive, ref } from "vue";
import { state, plants, areas, notify } from "../data/tenants";
import UiModal from "./UiModal.vue";
import UiInput from "./UiInput.vue";
import UiSelect from "./UiSelect.vue";
import UiButton from "./UiButton.vue";
const props = defineProps({ tenant: Object });
const emit = defineEmits(["close"]);
const form = reactive({
  name: props.tenant?.name || "",
  code: props.tenant?.code || "",
  plant: props.tenant?.plant || "FUQING",
  area: props.tenant?.area || "OP",
  admin: props.tenant?.admin || "",
  units: props.tenant?.units || "1# 2# 机组",
});
const error = ref("");
function save() {
  if (!form.name.trim() || !form.code.trim() || !form.admin.trim()) {
    error.value = "请填写租户名称、租户标识和管理员";
    return;
  }
  if (
    state.tenants.some(
      (t) => t.code === form.code.trim() && t.id !== props.tenant?.id,
    )
  ) {
    error.value = "租户标识已存在";
    return;
  }
  const values = {
    ...form,
    name: form.name.trim(),
    code: form.code.trim(),
    initials: form.admin
      .split(".")
      .map((x) => x[0])
      .join("")
      .slice(0, 2),
  };
  if (props.tenant) Object.assign(props.tenant, values);
  else
    state.tenants.unshift({
      ...values,
      id: Math.max(...state.tenants.map((t) => t.id)) + 1,
      description: "",
      projects: 0,
      status: "active",
      members: 1,
      seats: 100,
      storage: 0,
      storageLimit: 5,
    });
  notify(props.tenant ? "基本信息已更新" : "租户已创建");
  emit("close");
}
</script>
<template>
  <UiModal
    :title="tenant ? '编辑基本信息' : '新建租户 (+ New tenant)'"
    @close="$emit('close')"
    ><form class="modal-form" @submit.prevent="save">
      <UiInput v-model="form.name" label="租户名称" required /><UiInput
        v-model="form.code"
        label="租户标识"
        required
      />
      <div class="form-columns">
        <UiSelect
          v-model="form.plant"
          label="所属电厂"
          :options="plants.slice(1)"
        /><UiSelect
          v-model="form.area"
          label="专业领域"
          :options="areas.slice(1)"
        />
      </div>
      <UiInput v-model="form.units" label="关联机组" /><UiInput
        v-model="form.admin"
        label="租户管理员"
        required
      />
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <div class="modal-actions">
        <UiButton @click="$emit('close')">取消</UiButton
        ><UiButton type="submit" variant="primary">{{
          tenant ? "保存修改" : "创建租户"
        }}</UiButton>
      </div>
    </form></UiModal
  >
</template>
