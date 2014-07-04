angular.module('colorcode', [], function($provide) {
        $provide.factory('colorcodeService', [function(){
            return {
                applyColor: function(cssSelector, low, high, color) {
                    angular.forEach(document.getElementsByClassName(cssSelector), function(item, index) {
                        var value = parseFloat(item.innerHTML.replace('$', '').replace(new RegExp(',', 'g'), ''));
                        if((low == null && high == null)|| (low==null && value<=high) || (high==null && value>=low) || (value<=high && value>=low))
                            item.style.backgroundColor = color;
                    });
                }
            };
        }]);
    });
