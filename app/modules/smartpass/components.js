/* ======================[ @TODO: Inline Editable ]====================== */
SmartPassModule.directive('ngEnter', function() {
    return function(scope, elm, attrs) {
        elm.bind('keypress', function(e) {
            if (e.charCode === 13) scope.$apply(attrs.ngEnter);
        });
    };
});    

SmartPassModule.directive('inlineEdit', function() {
    return {
        // can be in-lined or async loaded by xhr
        // or inlined as JS string (using template property)
        templateUrl: 'componentTpl.html',
        scope: {
            model: 'accessor' 
        }
    };
});

SmartPassModule.directive('contenteditable', function() {
return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
        // view -> model
        elm.bind('blur', function() {
            scope.$apply(function() {
                ctrl.$setViewValue(elm.html());
            });
        });

        // model -> view
        ctrl.render = function(value) {
            elm.html(value);
        };

        // load init value from DOM
        ctrl.$setViewValue(elm.html());

        elm.bind('keydown', function(event) {
            console.log("keydown " + event.which);
            var esc = event.which == 27,
                el = event.target;

            if (esc) {
                    console.log("esc");
                    ctrl.$setViewValue(elm.html());
                    el.blur();
                    event.preventDefault();                        
                }

        });

    }
};
});

/**
 * Custom Tabs directive
 *
 * @usage
 *
 * 	<tabs>
 <pane title="Tab 1">
 Tab 1
 </pane>
 <pane title="Tab 2">
 Tab 2
 </pane>
 </tabs>
 */
SmartPassModule.directive('tabs', function() {
    return {
        restrict : 'E',
        transclude : true,
        scope : {},
        controller : function($scope, $element) {
            var panes = $scope.panes = [];

            $scope.select = function(pane) {
                angular.forEach(panes, function(pane) {
                    pane.selected = false;
                });
                pane.selected = true;
            }

            this.addPane = function(pane) {
                if (panes.length == 0)
                    $scope.select(pane);
                panes.push(pane);
            }
        },
        template : '<div class="tabbable">' + '<ul class="nav nav-tabs">' + '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">' + '<a href="" ng-click="select(pane)">{{pane.title}}</a>' + '</li>' + '</ul>' + '<div class="tab-content" ng-transclude></div>' + '</div>',
        replace : true
    };
}).directive('pane', function() {
    return {
        require : '^tabs',
        restrict : 'E',
        transclude : true,
        scope : {
            title : '@'
        },
        link : function(scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template : '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' + '</div>',
        replace : true
    };
});

/**
 * 
 * @name - Box  
 * @comment - This creates a generic box for a directive example.
 * @usage 
 * <box title="Name">[Contents]</box>
 * 
 */
SmartPassModule.directive('box', function() {
    return {
        restrict : 'E',
        transclude : true,
        scope : 'isolate',
        locals : {
            title : 'bind'
        },
        template : '<div style="border: 1px solid black;">' + '<div style="background-color: gray">{{title}}</div>' + '<div ng-transclude></div>' + '</div>'
    };
});

/**
 * 
 * @name - FormItem  
 * @comment - This creates a form control group.
 * @usage 
 * <formitem title="Label:" type="text">[Contents]</box>
 * 
 */
SmartPassModule.directive('formitem', function() {
    return {
        restrict : 'E',
        transclude : true,
        scope : {
            title : '@title',
            icon : '@icon'
        },
        template : '<div class="control-group">' + '<div class="control-label"><label>{{title}} </label></div>' + '<div class="controls" ng-transclude></div>' + '</div>'
    };
});

/**
 * @TODO - Name, docs, usage
 */
SmartPassModule.directive('portlet', function() {
    return {
        restrict : 'E',
        // This HTML will replace the zippy directive.
        replace : true,
        transclude : true,
        scope : 'isolate',
        locals : {
            title : 'bind'
        },
        template : '<div class="box" id="box-">' + '<h4 class="box-header round-top">{{title}}' + '<a class="box-btn" title="close"><i class="icon-remove"></i></a>' + '<a class="box-btn" title="toggle"><i class="icon-minus"></i></a>' + '<a class="box-btn" title="config" data-toggle="modal" href="#box-config-modal"><i class="icon-cog"></i></a>' + '</h4>' + '<div class="box-container-toggle"><div class="box-content" ng-transclude></div></div>' + '</div>'
    };
});

/**
 * @TODO - Name, docs, usage
 */
SmartPassModule.directive('thumbox', function() {
    return {
        restrict : 'E',
        transclude : true,
        scope : {

        },
        locals : {
            title : 'bind'
        },
        template : ' <ul class="thumbnails wizard-themes">' + '<li id="{{theme.slug}}" class="span3 wizard-theme" ng-model="smartapp.theme" ng-repeat="theme in wizard.themes">' + '<a class="thumbnail" ng-click="themeClick()" ng-model="smartapp.theme"> <img ng-src="{{theme.image}}" alt="{{theme.title}} Image"/>' + '<div class="category">' + '<i class="icon-home icon-white"></i>' + '<span>{{theme.title}}</span>' + '</div>' + '<div class="caption">' + '<div class="title">' + '<p class="banner" style="display: none;"><span>SELECTED</span></p>' + '</div>' + '<p>{{theme.body}}</p>' + '<input type="checkbox" name="data[Smartapp][theme]" value="{{theme.id}}" class="theme-radio" ng-change="themeClick()" ng-model="smartapp.theme"/>' + '</div> </a>' + '</li>' + '</ul>'
    };
});

/**
 * @TODO - Name, docs, usage
 */
SmartPassModule.directive('widget', function() {
    return {
        /**
         * E - Element name: <my-directive></my-directive>
         A - Attribute: <div my-directive="exp"> </div>
         C - Class: <div class="my-directive: exp;"></div>
         M - Comment: <!-- directive: my-directive exp -->
         */
        restrict : 'E',
        // This HTML will replace the zippy directive.
        replace : true,
        transclude : true,
        scope : {
            title : '@title',
            icon : '@icon'
        },
        template : '<div class="portlet opened">' + '<h4 class="portlet-header ui-widget-header ui-corner-all"><i class="icon-{{icon}}"></i> {{title}}' + '<span class="ui-icon toggle-icon ui-icon-plusthick"></span>' + '</h4>' + '<section class="portlet-container-toggle"><div class="portlet-content" ng-transclude></div></section>' + '</div>',
        // The linking function will add behavior to the template
        link : function(scope, element, attrs) {
            // Title element
            var title = angular.element(element.find('h4')),
            // Opened / closed state
            opened = false;

            // Clicking on title should open/close the zippy
            title.bind('click', toggle);

            // Toggle the closed/opened state
            function toggle() {
                opened = !opened;
                element.removeClass( opened ? 'closed' : 'opened');
                element.addClass( opened ? 'opened' : 'closed');
                element.find('.toggle-icon').addClass( opened ? 'ui-icon-minusthick' : 'ui-icon-plusthick');
                element.find('.toggle-icon').removeClass( opened ? 'ui-icon-plusthick' : 'ui-icon-minusthick');
            }

            // initialize the widget
            toggle();
        }
    };
});



/**
 * @TODO - Name, docs, usage
 */
SmartPassModule.directive('fileuploader', function(){
 return {
        restrict : 'E',
        transclude : true,
        scope : 'isolate',
        locals : {
            title : 'bind'
        },
        template : '<div class="ame-fileuploader">' + '<div ng-transclude>[File Uploader]</div>' + '</div>'
    };
});




/**
 * Truncate Filter
 * @Param text
 * @Param length, default is 10
 * @Param end, default is "..."
 * @return string
 */
angular.module('filters', []).
    filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });

/**
 * Usage
 *
 * var myText = "This is an example.";
 *
 * {{myText|Truncate}}
 * {{myText|Truncate:5}}
 * {{myText|Truncate:25:" ->"}}
 * Output
 * "This is..."
 * "Th..."
 * "This is an e ->"
 *
 */