public class JSObject {
	Map<String, Object> source;
    private JSObject() {}
    
    public static JSObject wrap(Object o) {
    	JSObject ret = new JSObject();
        ret.source = (Map<String, Object>) o;
        return ret;
    }
    
    public Object get(String key) {
    	return source.get(key);
    }
    
    public JSObject getAsObject(String key) {
    	return wrap(this.get(key));
    }
    
    public List<JSObject> getAsList(String key) {
        List<JSObject> ret = new List<JSObject>();
        for(Object item: (List<Object>)this.get(key)) {
        	ret.add(JSObject.wrap(item));	
        }
    	return ret;
    }
}
