<template>
    <div>Hello</div>
</template>

<script>
export default {
    props:['state-resources'],
    mounted(){
        setTimeout(()=>{
            console.log(this.stateResources)
        },500)
    }
}
</script>