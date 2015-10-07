// JSQueue
var JSQueue = JSQueue || new (function() {
    var jsqueue = this;
    
    var config = {
        params : {
            asyncRun : false,
            autoRun : false,
            done : undefined,
            feedback : undefined,
            error : undefined,
            tryCatch : false
        },
        parse : function(p) {
            if (typeof p !== 'undefined') {
                for (var k in p) {
                    config.params[k] = p[k];   
                }
                
                return true;
            } else {
                return false;   
            }
        }
    };
    
    var _q = [];
    var _running = false;
    var _pushed = 0;
    var _ran = 0;
    var _wasInit = false;
    
    var executeNext = function() {
        if (_q.length != 0 && _running) {
            var _f = _q.shift();
            
            setTimeout(function() {
                _f.running = true;
                var ret = undefined;
                
                if (config.params.tryCatch) {
                    try {
                        ret = _f.func();
                    } catch (ex) {
                        if (config.params.error) {
                            config.params.error({
                                "id" : _f.id,
                                "exception" : ex
                            });   
                        }
                    }
                } else {
                    ret = _f.func();
                }
                
                _f.running = false;
                _f.finished = true;
                
                _ran++;
                
                if (!config.params.asyncRun) {
                    executeNext();
                }
                
                if (config.params.feedback) {
                    setTimeout(function() {
                        config.params.feedback({
                            progress : _ran / _pushed,
                            id : _f.id,
                            status : "finished",
                            value : ret
                        });
                    }, 0);
                }
            }, 0);
            
            if (config.params.asyncRun) {
                executeNext();
            }
        } else {
            _running = false;
            
            if (config.params.done) {
                config.params.done();
            }
        }
    };
    
    var createQueueObject = function(func, idt) {
        _q.push({
            "func" : func,
            "id" : idt,
            "running" : false,
            "finished" : false
        });
    };
    
    this.isRunning = function() {
        return _running;  
    };
    
    this.getProgress = function() {
        return _ran / _pushed;
    };  
    
    this.queue = function(func, idt) {
        createQueueObject(func, idt);
        _pushed++;
        
        if (config.params.autoRun) {
            this.execute();   
        }
    };
    
    this.pause = function() {
        _running = false;
    };
    
    this.updateParams = function(params) {
        return config.parse(params);
    };
    
    this.execute = function() {
        if (!_running) {
            _running = true;
            executeNext();
            
            return true;
        } else {
            return false;   
        }
    };
    
    this.init = function(params) {
        return config.parse(params);
        
        _q = [];
        _running = false;
        _pushed = 0;
        _ran = 0;    
        _wasInit = true;
    };
})();