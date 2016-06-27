(function () {
    'use strict';

    /* Enforcer Assignments view -- displays maps with an assignment for each traffic
     * enforcer specified in the parameters
     */

    /* ngInject */
    function EnforcerAssignmentsController($state, $stateParams, $q, $translate, $window,
                                           RecordState, Assignments) {
        var ctl = this;

        $translate.onReady(init);

        function init() {
            ctl.loading = true;
            ctl.params = $stateParams;
            ctl.dateFormat = 'long';
            ctl.printPage = printPage;

            Assignments.query(ctl.params).$promise.then(function(assignments) {
                ctl.assignments = assignments;
            },
            function (error) {
                ctl.error = error.data.detail;
            }).finally(function () {
                ctl.loading = false;
            });
        }

        function printPage() {
            $window.print();
        }
    }

    angular.module('driver.enforcers')
    .controller('EnforcerAssignmentsController', EnforcerAssignmentsController);

})();
