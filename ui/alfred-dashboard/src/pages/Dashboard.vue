<template>
  <div class="dashboard">
    <md-toolbar>
        <md-button class="md-icon-button" @click.native="toggleLeftSidenav">
            <md-icon>menu</md-icon>
        </md-button>
        <h1 class="md-title">Alfred Dashboard</h1>
    </md-toolbar>

    <md-sidenav class="md-left" ref="leftSidenav">
        <md-toolbar>
            <div class="md-toolbar-container">
                <h3 class="md-title">Quick Links</h3>
            </div>
        </md-toolbar>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi cupiditate esse necessitatibus beatae nobis, deserunt ut est fugit, tempora deleniti, eligendi commodi doloribus. Nemo, assumenda possimus, impedit inventore perferendis iusto!</p>
    </md-sidenav>
    <md-card class="card">
        <md-card-area md-inset>
            <md-card-header>
                <h2 class="md-title">Services Available</h2>
                <div class="md-subhead">
                    
                </div>
            </md-card-header>

            <md-card-content>
                This represents all services currently connected to Alfred
            </md-card-content>
        </md-card-area>

        <md-card-content>
            Content to replace
        </md-card-content>
    </md-card>
    <md-card class="card">
        <md-card-area md-inset>
            <md-card-header>
                <h2 class="md-title">Requests History</h2>
                <div class="md-subhead">
                    
                </div>
            </md-card-header>

            <md-card-content>
                This represents the history of the requests proceeded by Alfred
            </md-card-content>
        </md-card-area>

        <md-card-content>
            Content to replace
        </md-card-content>
    </md-card>
    <md-card class="card">
        <md-card-area md-inset>
            <md-card-header>
                <h2 class="md-title">My Home</h2>
                <div class="md-subhead">
                    
                </div>
            </md-card-header>

            <md-card-content>
                This 
            </md-card-content>
        </md-card-area>

        <md-card-content>
            Content to replace
        </md-card-content>
    </md-card>
  </div>
</template>

<script>
export default {
  name: 'dashboard',
  methods: {
    toggleLeftSidenav() {
      this.$refs.leftSidenav.toggle();
    },
    toggleRightSidenav() {
      this.$refs.rightSidenav.toggle();
    },
    closeRightSidenav() {
      this.$refs.rightSidenav.close();
    }
  },
  data () {
    return {
      
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .card {
        display: inline-block;
        margin: 10px;
    }
</style>
