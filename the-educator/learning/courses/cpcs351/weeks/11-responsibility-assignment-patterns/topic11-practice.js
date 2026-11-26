(() => {
  'use strict';
  const version = '20261126';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => 'SAR ' + value.toFixed(2);
  const node = (title, detail, role = '', state = '') => '<div class="node ' + state + '">' +
    (role ? '<span class="role">' + escape(role) + '</span>' : '') +
    '<b>' + escape(title) + '</b><small>' + escape(detail) + '</small></div>';
  const flow = nodes => '<div class="flow" style="--cols:' + nodes.length + '">' + nodes.join('') + '</div>';
  const button = (id, text, primary = false) => '<button type="button" class="btn' + (primary ? ' primary' : '') + '" id="' + id + '">' + text + '</button>';
  const select = (id, label, items) => '<label class="field">' + label + '<select id="' + id + '">' + items.map(([value, text]) => '<option value="' + value + '">' + escape(text) + '</option>').join('') + '</select></label>';
  const quantity = (id, label, value = 1) => '<label class="field">' + label + '<input id="' + id + '" type="number" min="1" max="5" step="1" value="' + value + '"></label>';
  const count = el => Number.isInteger(el.valueAsNumber) && el.valueAsNumber >= 1 && el.valueAsNumber <= 5 ? el.valueAsNumber : null;
  const definitions = {
    'index': {
      title: 'Choose a pattern family from the problem',
      scenario: 'A university app team faces different design problems. Identify the kind of problem first, then choose a pattern that fits.',
      label: 'Pattern foundations',
      takeaway: 'Creational patterns organize creation. Structural patterns organize connections. Behavioral patterns organize interaction. GRASP assigns responsibilities.',
      question: 'Which family focuses on object creation?', choices: ['Creational', 'Structural'], correct: 0,
      answer: 'Creational is correct. The design pressure concerns how objects are constructed.', run: foundations
    },
    'builder': {
      title: 'Build an order at a campus café',
      scenario: 'A café app builds drinks with different sizes, milk choices and optional extra shots. Select the parts, then create a finished drink. Build a second drink to compare the two products.',
      label: 'Builder · step-by-step construction',
      takeaway: 'The builder collects construction choices. build() creates a separate finished product. A Director can prescribe a sequence, but is optional in this example.',
      question: 'What does build() return here?', choices: ['A finished Drink', 'The builder itself'], correct: 0,
      answer: 'A finished Drink. The builder and the product have different responsibilities.', run: builder
    },
    'factory-method': {
      title: 'Send a campus event notice',
      scenario: 'The university sends notices by email or SMS. The shared workflow stays in Campaign. A subclass overrides the factory method to choose the sender product.',
      label: 'Factory Method · subclass chooses product',
      takeaway: 'The inherited workflow calls createSender(). Each concrete Campaign subclass returns a different Sender through the same operation.',
      question: 'Who decides which concrete Sender is created?', choices: ['The Campaign subclass', 'The student screen'], correct: 0,
      answer: 'The concrete Campaign subclass overrides createSender(). The common workflow works through the Sender interface.', run: factoryMethod
    },
    'facade': {
      title: 'Reserve a seat at a university event',
      scenario: 'A student wants one Reserve action. Behind it, three services check capacity, record a booking and issue a pass. This local simulation starts with two available seats.',
      label: 'Facade · one entry to a subsystem',
      takeaway: 'The Facade coordinates the services through one operation. The individual services still own their work.',
      question: 'What is the student screen’s main dependency here?', choices: ['EventBookingFacade', 'All three services directly'], correct: 0,
      answer: 'EventBookingFacade gives the screen one simpler entry. It delegates the actual work to the services.', run: facade
    },
    'adapter': {
      title: 'Connect a café checkout to a payment API',
      scenario: 'Checkout expects charge(riyals). A fictional provider offers debitHalalas(halalas). The Adapter translates the method call and converts riyals to halalas. No real payment is sent.',
      label: 'Adapter · translate an incompatible interface',
      takeaway: 'The client keeps its expected interface. The Adapter wraps the provider and translates the request before delegating.',
      question: 'What should convert SAR 27.50 to 2,750 halalas?', choices: ['The Adapter', 'Every checkout screen'], correct: 0,
      answer: 'The Adapter owns this translation. Keeping it in one place avoids spreading provider details through the app.', run: adapter
    },
    'observer': {
      title: 'Follow a university shuttle update',
      scenario: 'A shuttle publishes a new status. Subscribed displays receive the update. Unsubscribe one display and publish another status to see which receivers are notified.',
      label: 'Observer · notify current subscribers',
      takeaway: 'The publisher calls the subscribers’ update operation. Unsubscribed displays keep their last value. A new subscription receives the next published change.',
      question: 'After unsubscribing, does a display receive the next update?', choices: ['No', 'Yes'], correct: 0,
      answer: 'No. It is removed from the publisher’s subscriber set. The display can still show the last value it received.', run: observer
    },
    'design-principles': {
      title: 'Review changes to a campus services app',
      scenario: 'Choose a principle, compare two small designs and try the change. Each case shows the specific contract or responsibility being tested.',
      label: 'Design principles · inspect the consequences',
      takeaway: 'Choose a principle because it addresses a specific design problem. The example shows a local consequence, not a universal quality score.',
      question: 'Does a class with one method automatically satisfy SRP?', choices: ['No', 'Yes'], correct: 0,
      answer: 'No. SRP concerns a focused responsibility and reason to change, rather than a count of methods.', run: principles
    },
    'grasp-controller': {
      title: 'Book a university study room',
      scenario: 'A student presses Reserve. A RoomBookingController receives that system event, asks the schedule about availability and records the booking. Try the same slot twice.',
      label: 'GRASP Controller · receive and coordinate',
      takeaway: 'The controller coordinates the use case. RoomSchedule owns availability rules, while BookingStore records the confirmed booking.',
      question: 'Who should receive the Reserve system event from the UI?', choices: ['RoomBookingController', 'A screen widget'], correct: 0,
      answer: 'RoomBookingController receives the system event. It delegates domain decisions to the objects that own them.', run: controller
    },
    'controller-quality': {
      title: 'Compare two club registration controllers',
      scenario: 'Both designs register a student for a club event. Compare a controller that does every task with one that delegates. Then change the eligibility rule.',
      label: 'Controller quality · delegation and cohesion',
      takeaway: 'A focused controller receives the event and coordinates collaborators. A large controller that also holds policies, persistence and notification details has several reasons to change.',
      question: 'Where should the eligibility rule live in the delegated design?', choices: ['EventPolicy', 'RegistrationScreen'], correct: 0,
      answer: 'EventPolicy owns eligibility. The controller asks it for a decision and coordinates what happens next.', run: controllerQuality
    },
    'expert': {
      title: 'Calculate a campus café order total',
      scenario: 'Order contains its order lines. Each OrderLine knows its quantity and unit price. Change the quantities, then ask Order for the total.',
      label: 'Information Expert · behavior follows knowledge',
      takeaway: 'Order knows its lines, so it calculates the total by asking each line for a subtotal. Each OrderLine is the expert on its own quantity and price.',
      question: 'Who should know how to calculate a line subtotal?', choices: ['OrderLine', 'CheckoutScreen'], correct: 0,
      answer: 'OrderLine already has quantity and unit price. It can calculate its own subtotal without exposing that calculation to the screen.', run: expert
    },
    'creator': {
      title: 'Add items to a restaurant order',
      scenario: 'An Order contains OrderLine objects and receives the item, price and quantity. Let Order create each new line and keep it in its collection.',
      label: 'GRASP Creator · assign creation responsibility',
      takeaway: 'Order is a suitable creator because it contains the lines and has their initialization data. Creator is a responsibility guideline; it does not require subclassing.',
      question: 'Why is Order a good creator of OrderLine?', choices: ['It contains lines and has their data', 'Its name includes Order'], correct: 0,
      answer: 'Containment and available initialization data justify this responsibility. Naming alone does not.', run: creator
    },
    'worked-example': {
      title: 'Trace one campus café checkout',
      scenario: 'Submit a small order and follow three responsibility decisions. Controller receives the event, Creator constructs the line and Information Expert calculates the total.',
      label: 'Integrated example · Controller + Creator + Expert',
      takeaway: 'Several responsibility patterns can appear in one collaboration. Explain which object receives, creates and calculates at each step.',
      question: 'Which role does Order play when it calculates the total?', choices: ['Information Expert', 'The UI controller'], correct: 0,
      answer: 'Order is Information Expert for its total because it knows its lines. Its addLine operation also makes it a Creator in this example.', run: integrated
    },
    'review': {
      title: 'Choose a pattern and justify it',
      scenario: 'Read one familiar design situation at a time. Choose the best pattern for the stated design pressure, then check the reason.',
      label: 'Retrieval practice · nine design decisions',
      takeaway: 'First identify the pressure. Then name a fitting pattern and explain which responsibility or dependency it improves.',
      run: review
    }
  };

  function builder(root) {
    const $ = id => root.querySelector('#' + id);
    class DrinkBuilder {
      constructor() { this.parts = {}; }
      size(value) { this.parts.size = value; return this; }
      milk(value) { this.parts.milk = value; return this; }
      extra(value) { this.parts.shot = value; return this; }
      build(id) {
        if (!this.parts.size || !this.parts.milk) throw new Error('Choose a size and milk before building.');
        return Object.freeze({ id, ...this.parts });
      }
    }
    let next = 1;
    const products = [];
    root.querySelector('.body').innerHTML = '<div class="controls">' + select('size','Size',[['','Choose size'],['small','Small'],['large','Large']]) +
      select('milk','Milk',[['','Choose milk'],['regular','Regular'],['oat','Oat']]) +
      select('shot','Extra shot',[['no','No extra shot'],['yes','Add one shot']]) +
      button('build','Build drink',true) + '</div><div class="split"><div class="product" id="cup"></div><div><h4>Finished products</h4><div id="products" class="saved">Your finished drinks will appear here.</div></div></div><pre class="trace" id="trace">Choose the parts, then call build().</pre><div class="feedback" id="result" role="status" aria-live="polite">The product is created only when you build it.</div>';
    function cup() {
      const large = $('size').value === 'large';
      const y = large ? 48 : 87;
      $('cup').innerHTML = '<svg viewBox="0 0 180 200" role="img" aria-label="Drink construction preview"><defs><clipPath id="cup-clip"><path d="M42 45H138L123 178H57Z"/></clipPath></defs><ellipse cx="90" cy="185" rx="52" ry="8" fill="#d6e3f9"/><path d="M42 45H138L123 178H57Z" fill="#fff" stroke="#7d9bc3" stroke-width="2"/>' +
        ($('size').value ? '<rect x="40" y="' + y + '" width="100" height="135" fill="' + ($('milk').value === 'oat' ? '#e5c9a1' : '#9e684f') + '" clip-path="url(#cup-clip)"/>' : '') +
        '<rect x="39" y="36" width="102" height="12" rx="5" fill="#244975"/><rect x="52" y="98" width="76" height="36" rx="6" fill="#ecf2ff"/><text x="90" y="121" text-anchor="middle" font-size="13" fill="#244975">Campus Café</text></svg>';
    }
    ['size','milk','shot'].forEach(id => $(id).addEventListener('change', cup));
    $('build').addEventListener('click', () => {
      try {
        const b = new DrinkBuilder().size($('size').value).milk($('milk').value).extra($('shot').value === 'yes');
        const drink = b.build(next++);
        products.push(drink);
        $('products').innerHTML = products.slice(-2).map(p => '<div class="saved-item"><b>Drink #' + p.id + '</b> · ' + escape(p.size) + ' · ' + escape(p.milk) + ' milk' + (p.shot ? ' · extra shot' : '') + '</div>').join('');
        $('trace').textContent = 'DrinkBuilder\n  .size("' + drink.size + '")\n  .milk("' + drink.milk + '")\n  .extra(' + drink.shot + ')\n  .build() → Drink #' + drink.id;
        $('result').textContent = 'Drink #' + drink.id + ' is a separate finished product. Later choices do not change earlier drinks.';
        $('result').className = 'feedback good';
      } catch (e) { $('result').textContent = e.message; $('result').className = 'feedback warn'; }
    });
    cup();
  }

  function factoryMethod(root) {
    const $ = id => root.querySelector('#' + id);
    class EmailSender { send() { return 'EmailSender.send() → simulated email ready'; } }
    class SmsSender { send() { return 'SmsSender.send() → simulated SMS ready'; } }
    class Campaign {
      run() { const sender = this.createSender(); return { product:sender.constructor.name, result:sender.send() }; }
    }
    class EmailCampaign extends Campaign { createSender() { return new EmailSender(); } }
    class SmsCampaign extends Campaign { createSender() { return new SmsSender(); } }
    const creators = {email:EmailCampaign, sms:SmsCampaign};
    root.querySelector('.body').innerHTML = '<div class="controls">' + select('channel','Campaign subclass',[['email','EmailCampaign'],['sms','SmsCampaign']]) + button('run','Run shared workflow',true) + '</div><div id="diagram"></div><pre class="trace" id="trace">Campaign.run() calls the overridable factory method.</pre><div class="feedback" id="result" role="status" aria-live="polite">This is a local simulation. Nothing is sent.</div>';
    function diagram() {
      const email = $('channel').value === 'email';
      $('diagram').innerHTML = flow([node(email?'EmailCampaign':'SmsCampaign','Overrides createSender()','Concrete Creator'),node('Campaign.run()','Inherited send workflow','Creator workflow'),node(email?'EmailSender':'SmsSender','Implements send()','Product')]);
    }
    $('channel').addEventListener('change', diagram);
    $('run').addEventListener('click', () => {
      const campaign = new creators[$('channel').value]();
      const output = campaign.run();
      $('trace').textContent = campaign.constructor.name + ' inherits Campaign.run()\n  → this.createSender()\n  → new ' + output.product + '()\n  → sender.send()';
      $('result').textContent = output.result;
      $('result').className = 'feedback good';
    });
    diagram();
  }

  function facade(root) {
    const $ = id => root.querySelector('#' + id);
    const seats = { remaining:2, reserve() { if (this.remaining === 0) return false; this.remaining--; return true; } };
    const bookings = { items:[], record() { const id='B'+String(this.items.length+1).padStart(2,'0'); this.items.push(id); return id; } };
    const passes = { issue(id) { return 'PASS-' + id; } };
    class EventBookingFacade {
      reserve() {
        const trace=['EventBookingFacade.reserve()','  → SeatService.reserve()'];
        if (!seats.reserve()) return {trace, error:'No seats remain. No booking or pass was created.'};
        const id=bookings.record(); trace.push('  → BookingService.record() = '+id);
        const pass=passes.issue(id); trace.push('  → PassService.issue('+id+') = '+pass);
        return {trace,pass};
      }
    }
    const entry = new EventBookingFacade();
    root.querySelector('.body').innerHTML = '<div class="controls">' + button('reserve','Reserve a seat',true) + button('reset','Restart demo') + '<span class="label" id="capacity"></span></div>' +
      flow([node('SeatService','Owns capacity'),node('BookingService','Records confirmed bookings'),node('PassService','Issues a pass')]) +
      '<pre class="trace" id="trace">Student screen → EventBookingFacade.reserve()</pre><div class="feedback" id="result" role="status" aria-live="polite">Reserve a seat to see the delegated calls.</div>';
    function capacity() { $('capacity').textContent=seats.remaining+' of 2 seats available'; }
    $('reserve').addEventListener('click',()=>{const out=entry.reserve();$('trace').textContent=out.trace.join('\n');$('result').textContent=out.error||('Reserved. '+out.pass+' is ready.');$('result').className='feedback '+(out.error?'warn':'good');capacity();});
    $('reset').addEventListener('click',()=>{seats.remaining=2;bookings.items=[];$('result').textContent='Two seats are available again.';$('result').className='feedback';$('trace').textContent='Student screen → EventBookingFacade.reserve()';capacity();});
    capacity();
  }

  function adapter(root) {
    const $ = id => root.querySelector('#' + id);
    class Provider { debitHalalas(value) { if (!Number.isInteger(value)) throw new Error('Provider requires whole halalas.'); return value; } }
    class PaymentAdapter {
      constructor(provider) { this.provider=provider; }
      charge(riyals) { return this.provider.debitHalalas(Math.round(riyals*100)); }
    }
    const provider=new Provider();
    root.querySelector('.body').innerHTML='<div class="controls">'+select('amount','Café total',[['27.50','SAR 27.50'],['40.00','SAR 40.00']])+button('direct','Try direct call')+button('adapt','Use Adapter',true)+'</div><div id="diagram"></div><pre class="trace" id="trace">Checkout expects charge(riyals).\nProvider offers debitHalalas(halalas).</pre><div class="feedback" id="result" role="status" aria-live="polite">Choose how the checkout calls the provider.</div>';
    function diagram() {const r=Number($('amount').value);$('diagram').innerHTML=flow([node('Checkout',money(r),'Client'),node('PaymentAdapter','charge(riyals) → debitHalalas(halalas)','Translator'),node('Provider',Math.round(r*100).toLocaleString('en-US')+' halalas','Adaptee')]);}
    $('amount').addEventListener('change',diagram);
    $('direct').addEventListener('click',()=>{try {provider.charge(Number($('amount').value));} catch(e){$('result').textContent='Interface mismatch. Provider has no charge() method.';$('result').className='feedback warn';$('trace').textContent='checkout → provider.charge(riyals)\n  × method is unavailable on Provider';}});
    $('adapt').addEventListener('click',()=>{const r=Number($('amount').value);const h=new PaymentAdapter(provider).charge(r);$('trace').textContent='checkout → adapter.charge('+r.toFixed(2)+')\n  → Math.round('+r.toFixed(2)+' × 100) = '+h+'\n  → provider.debitHalalas('+h+')';$('result').textContent='Compatible request prepared: '+h.toLocaleString('en-US')+' halalas. No real payment was sent.';$('result').className='feedback good';});
    diagram();
  }

  function observer(root) {
    const $ = id => root.querySelector('#' + id);
    class Shuttle {
      constructor() { this.status='Scheduled';this.subscribers=new Set(); }
      subscribe(listener) {this.subscribers.add(listener);}
      unsubscribe(listener) {this.subscribers.delete(listener);}
      publish(status) {if(this.status===status)return false;this.status=status;this.subscribers.forEach(s=>s.update(status));return true;}
    }
    const publisher=new Shuttle();
    const clients=[{name:'Student display',value:'Scheduled',calls:0},{name:'Notification preview',value:'Scheduled',calls:0},{name:'Staff display',value:'Scheduled',calls:0}];
    clients.forEach(c=>{c.update=status=>{c.value=status;c.calls++;};publisher.subscribe(c);});
    root.querySelector('.body').innerHTML='<div class="controls">'+select('status','New shuttle status',[['Boarding','Boarding'],['Departed','Departed'],['Scheduled','Scheduled']])+button('publish','Publish status',true)+'</div><div class="subscribers">'+clients.map((c,i)=>'<div class="subscriber" id="client-'+i+'"><label><input type="checkbox" id="sub-'+i+'" checked>'+c.name+'</label><strong id="value-'+i+'">Scheduled</strong><span class="minor" id="calls-'+i+'">0 notifications</span></div>').join('')+'</div><pre class="trace" id="trace">Shuttle publisher → subscribed update(status) methods</pre><div class="feedback" id="result" role="status" aria-live="polite">All three displays are currently subscribed.</div>';
    function draw() {clients.forEach((c,i)=>{$('value-'+i).textContent=c.value;$('calls-'+i).textContent=c.calls+' notification'+(c.calls===1?'':'s');$('client-'+i).classList.toggle('off',!$('sub-'+i).checked);});}
    clients.forEach((c,i)=>$('sub-'+i).addEventListener('change',()=>{if($('sub-'+i).checked)publisher.subscribe(c);else publisher.unsubscribe(c);draw();$('result').textContent=c.name+($('sub-'+i).checked?' will receive the next change.':' is unsubscribed and keeps its last value.');$('result').className='feedback';}));
    $('publish').addEventListener('click',()=>{const status=$('status').value;const changed=publisher.publish(status);$('trace').textContent=changed?'Shuttle.status = "'+status+'"\n'+[...publisher.subscribers].map(c=>'  → '+c.name+'.update("'+status+'")').join('\n'):'Status is already "'+status+'". No change event is published.';$('result').textContent=changed?publisher.subscribers.size+' subscribed display(s) notified.':'The selected status is unchanged.';$('result').className='feedback '+(changed?'good':'');draw();});
  }

  const principleCases = {
    srp:{name:'SRP · focused responsibility',change:'The café changes how receipts are formatted.',before:['CheckoutManager','Calculates totals and formats receipts'],after:['ReceiptFormatter','Only formats receipts'],bad:'CheckoutManager must change for both pricing and receipt-format reasons.',good:'ReceiptFormatter changes for this request. Order pricing keeps its own responsibility.'},
    ocp:{name:'OCP · extension through a stable contract',change:'Add a new university-club discount.',before:['DiscountCalculator','Edits an existing if/else chain'],after:['ClubDiscount','Implements DiscountStrategy'],bad:'The central conditional must be edited to add this discount.',good:'A new ClubDiscount implementation is added and selected at setup. Existing strategies are untouched.'},
    lsp:{name:'LSP · preserve the promised behavior',change:'A client sends a PDF to an object through PdfPrinter.print(pdf).',before:['PhotoOnlyPrinter','Rejects the promised PDF operation'],after:['OfficePdfPrinter','Accepts the valid PDF operation'],bad:'Substitution fails: the implementation rejects an operation promised by PdfPrinter.',good:'Substitution succeeds for this contract: the implementation accepts the valid PDF request.'},
    isp:{name:'ISP · interfaces match client needs',change:'A small classroom printer only supports printing.',before:['PrintScanDevice','Requires print() and scan()'],after:['Printable','Requires print() only'],bad:'The printer is forced to implement scan() even though it cannot scan.',good:'The printer implements Printable. Devices with scanners can also implement Scannable.'},
    dip:{name:'DIP · depend on abstractions',change:'Replace the provider used for campus event messages.',before:['EventService','Calls VendorSmsApi directly'],after:['EventService','Calls MessageSender'],bad:'EventService depends on provider details, so its provider-specific calls must change.',good:'A new provider adapter implements MessageSender. EventService keeps its interface dependency.'},
    coupling:{name:'Low Coupling · reduce direct dependencies',change:'The event booking subsystem changes its pass-generation API.',before:['BookingScreen','Calls Seat, Booking and Pass services'],after:['BookingScreen','Calls EventBookingFacade'],bad:'BookingScreen directly depends on the changed Pass API.',good:'The Facade handles the subsystem change. The screen continues to use its stable reserve() operation.'},
    cohesion:{name:'High Cohesion · group related work',change:'The club changes its membership eligibility rule.',before:['CampusManager','Handles eligibility, parking and room bookings'],after:['MembershipPolicy','Handles membership eligibility'],bad:'The broad CampusManager mixes unrelated responsibilities and must change for this membership rule.',good:'MembershipPolicy groups related membership decisions. Parking and room logic are elsewhere.'}
  };
  function principles(root) {
    const $=id=>root.querySelector('#'+id);
    let improved=false;
    root.querySelector('.body').innerHTML='<div class="controls">'+select('principle','Design principle',Object.entries(principleCases).map(([k,v])=>[k,v.name]))+button('before','Original design')+button('after','Improved design')+'</div><p class="principle-caption" id="change"></p><div id="diagram"></div>'+button('try-change','Try this change',true)+'<div class="feedback" id="result" role="status" aria-live="polite">Apply the change to inspect the consequence.</div>';
    function draw(){const c=principleCases[$('principle').value];const item=improved?c.after:c.before;$('before').setAttribute('aria-pressed',String(!improved));$('after').setAttribute('aria-pressed',String(improved));$('change').textContent=c.change;$('diagram').innerHTML=flow([node('Client','Needs one clear capability'),node(item[0],item[1],improved?'Improved design':'Original design',improved?'active':'changed')]);$('result').textContent='Apply the change to inspect the consequence.';$('result').className='feedback';}
    $('before').addEventListener('click',()=>{improved=false;draw();});
    $('after').addEventListener('click',()=>{improved=true;draw();});
    $('principle').addEventListener('change',draw);
    $('try-change').addEventListener('click',()=>{const c=principleCases[$('principle').value];$('result').textContent=improved?c.good:c.bad;$('result').className='feedback '+(improved?'good':'warn');});
    draw();
  }

  function controller(root) {
    const $=id=>root.querySelector('#'+id);
    const schedule={reserved:false,isAvailable(){return !this.reserved;},markReserved(){this.reserved=true;}};
    const store={records:[],save(record){this.records.push(record);}};
    class RoomBookingController {
      reserve(){const trace=['UI → RoomBookingController.reserve()','  → RoomSchedule.isAvailable()'];if(!schedule.isAvailable())return {trace,error:'This slot is already reserved. Choose another slot.'};schedule.markReserved();store.save({room:'Library room A',slot:'12:00–13:00'});trace.push('  → RoomSchedule.markReserved()','  → BookingStore.save(booking)');return {trace};}
    }
    const ctl=new RoomBookingController();
    root.querySelector('.body').innerHTML='<div class="controls"><span class="label">Library room A · 12:00–13:00</span>'+button('reserve','Reserve study room',true)+button('reset','Restart demo')+'</div>'+flow([node('Student screen','Sends Reserve','Presentation'),node('RoomBookingController','Coordinates the request','Controller'),node('RoomSchedule','Knows slot availability','Domain')])+'<pre class="trace" id="trace">Reserve twice to test the same slot.</pre><div class="feedback" id="result" role="status" aria-live="polite">The room is available.</div>';
    $('reserve').addEventListener('click',()=>{const result=ctl.reserve();$('trace').textContent=result.trace.join('\n');$('result').textContent=result.error||'Booking confirmed. The controller delegated the availability decision and storage.';$('result').className='feedback '+(result.error?'warn':'good');});
    $('reset').addEventListener('click',()=>{schedule.reserved=false;store.records=[];$('result').textContent='The room is available again.';$('result').className='feedback';$('trace').textContent='UI → RoomBookingController.reserve()';});
  }

  function controllerQuality(root) {
    const $=id=>root.querySelector('#'+id);
    let delegated=false;
    let staffOnly=false;
    const policy={allows(student){return !staffOnly||student.isStaff;}};
    const records={save(){return 'Registration stored';}};
    const notifier={send(){return 'Confirmation prepared';}};
    class FocusedController {
      register(student){const trace=['RegistrationController.register(student)','  → EventPolicy.allows(student)'];if(!policy.allows(student))return {trace,allowed:false};trace.push('  → RegistrationStore.save() = '+records.save(),'  → ConfirmationService.send() = '+notifier.send());return {trace,allowed:true};}
    }
    class BroadController {
      register(student){const allowed=!staffOnly||student.isStaff;return {allowed,trace:['ClubController.register(student)','  → evaluates eligibility inside controller',...(allowed?['  → writes registration inside controller','  → prepares confirmation inside controller']:[])]};}
    }
    root.querySelector('.body').innerHTML='<div class="controls">'+button('broad','Everything in controller')+button('focused','Delegate responsibilities')+'</div><div id="diagram"></div><div class="controls">'+button('register','Try student registration',true)+button('policy','Change rule to staff-only')+'</div><pre class="trace" id="trace">The controller receives the same registration request in either design.</pre><div class="feedback" id="result" role="status" aria-live="polite">Current policy: students may register.</div>';
    function diagram(){ $('broad').setAttribute('aria-pressed',String(!delegated));$('focused').setAttribute('aria-pressed',String(delegated));$('diagram').innerHTML=delegated?flow([node('RegistrationController','Receives and coordinates','Controller'),node('EventPolicy','Checks eligibility','Domain'),node('Store + Confirmation','Persistence and messaging','Services')]):flow([node('Student screen','Sends registration request'),node('ClubController','Policy + storage + confirmation','Mixed responsibilities','changed')]);}
    $('broad').addEventListener('click',()=>{delegated=false;diagram();});
    $('focused').addEventListener('click',()=>{delegated=true;diagram();});
    $('register').addEventListener('click',()=>{const ctl=delegated?new FocusedController():new BroadController();const out=ctl.register({isStaff:false});$('trace').textContent=out.trace.join('\n');$('result').textContent=out.allowed?'Registration accepted. Inspect where each task runs.':'Registration rejected because the event is now staff-only.';$('result').className='feedback '+(out.allowed?'good':'warn');});
    $('policy').addEventListener('click',()=>{staffOnly=!staffOnly;$('policy').textContent=staffOnly?'Allow students again':'Change rule to staff-only';$('result').textContent=(staffOnly?'New policy: staff only. ':'New policy: students allowed. ')+(delegated?'The policy change belongs in EventPolicy.':'The policy change requires editing ClubController.');$('result').className='feedback '+(delegated?'good':'warn');$('trace').textContent='Changed rule owner: '+(delegated?'EventPolicy':'ClubController');});
    diagram();
  }

  class OrderLine {
    constructor(item,quantity,id){this.item=item;this.quantity=quantity;this.id=id;}
    subtotal(){return this.item.price*this.quantity;}
  }
  class Order {
    constructor(){this.lines=[];}
    addLine(item,quantity){const line=new OrderLine(item,quantity,'L'+(this.lines.length+1));this.lines.push(line);return line;}
    total(){return this.lines.reduce((sum,line)=>sum+line.subtotal(),0);}
  }
  const menu={sandwich:{name:'Chicken sandwich',price:12},juice:{name:'Fresh juice',price:5},coffee:{name:'Coffee',price:8}};
  function expert(root) {
    const $=id=>root.querySelector('#'+id);
    root.querySelector('.body').innerHTML='<div class="controls">'+quantity('sandwiches','Sandwiches · SAR 12',2)+quantity('juices','Juices · SAR 5',1)+button('calculate','Ask Order for total',true)+'</div>'+flow([node('Checkout screen','Requests the total','Client'),node('Order','Knows all its lines','Expert'),node('OrderLine','Knows quantity × unit price','Expert')])+'<div class="receipt"><div class="label">Calculated total</div><div class="metric" id="total">—</div></div><pre class="trace" id="trace">Change quantities, then ask Order for the total.</pre><div class="feedback" id="result" role="status" aria-live="polite">Prices and quantities are held in order lines.</div>';
    $('calculate').addEventListener('click',()=>{const a=count($('sandwiches')),b=count($('juices'));if(a===null||b===null){$('result').textContent='Enter whole quantities from 1 to 5.';$('result').className='feedback warn';return;}const order=new Order();order.addLine(menu.sandwich,a);order.addLine(menu.juice,b);$('total').textContent=money(order.total());$('trace').textContent='Order.total()\n  → sandwich line.subtotal(): '+a+' × 12 = '+(a*12)+'\n  → juice line.subtotal(): '+b+' × 5 = '+(b*5)+'\n  → sum = '+order.total();$('result').textContent='Order combines the subtotals returned by its lines. The screen only displays the result.';$('result').className='feedback good';});
  }
  function creator(root) {
    const $=id=>root.querySelector('#'+id);
    let order=new Order();
    root.querySelector('.body').innerHTML='<div class="controls">'+select('item','Menu item',Object.entries(menu).map(([k,v])=>[k,v.name+' · '+money(v.price)]))+quantity('qty','Quantity')+button('add','Ask Order to add item',true)+button('reset','New order')+'</div>'+flow([node('Student screen','Sends item and quantity','Client'),node('Order','Contains and creates its lines','Creator'),node('OrderLine','Receives price and quantity','New object')])+'<div class="receipt" id="receipt">Your order is empty.</div><pre class="trace" id="trace">Order.addLine(item, quantity) creates an OrderLine.</pre><div class="feedback" id="result" role="status" aria-live="polite">Add up to five lines in this demonstration.</div>';
    function draw(){ $('receipt').innerHTML=order.lines.length?order.lines.map(l=>'<div class="line"><span>'+l.id+' · '+escape(l.item.name)+' × '+l.quantity+'</span><span>'+money(l.subtotal())+'</span></div>').join('')+'<div class="total"><span>Total</span><span>'+money(order.total())+'</span></div>':'Your order is empty.';$('add').disabled=order.lines.length>=5;}
    $('add').addEventListener('click',()=>{const qty=count($('qty'));if(qty===null){$('result').textContent='Enter a whole quantity from 1 to 5.';$('result').className='feedback warn';return;}if(order.lines.length>=5)return;const item=menu[$('item').value];const line=order.addLine(item,qty);$('trace').textContent='UI → order.addLine("'+item.name+'", '+qty+')\n  → new OrderLine(item, quantity) = '+line.id+'\n  → order stores '+line.id+' in its lines collection';$('result').textContent='Order created '+line.id+' using the item and quantity it received.';$('result').className='feedback good';draw();});
    $('reset').addEventListener('click',()=>{order=new Order();draw();$('trace').textContent='A fresh Order has no lines yet.';$('result').textContent='Add an item to create the first line.';$('result').className='feedback';});
  }
  function integrated(root) {
    const $=id=>root.querySelector('#'+id);
    class CheckoutController {
      submit(item,qty){const order=new Order();const line=order.addLine(item,qty);const total=order.total();return {line,total};}
    }
    root.querySelector('.body').innerHTML='<div class="controls">'+select('item','Choose item',Object.entries(menu).map(([k,v])=>[k,v.name+' · '+money(v.price)]))+quantity('qty','Quantity',2)+button('submit','Submit café order',true)+'</div>'+flow([node('CheckoutController','Receives submitOrder()','Controller'),node('Order.addLine()','Creates a contained OrderLine','Creator'),node('Order.total()','Asks its lines for subtotals','Expert')])+'<div class="receipt"><div class="label">Order total</div><div class="metric" id="total">—</div></div><pre class="trace" id="trace">Follow one request through three responsibility decisions.</pre><div class="feedback" id="result" role="status" aria-live="polite">All steps run locally. No order is sent.</div>';
    $('submit').addEventListener('click',()=>{const qty=count($('qty'));if(qty===null){$('result').textContent='Enter a whole quantity from 1 to 5.';$('result').className='feedback warn';return;}const item=menu[$('item').value];const out=new CheckoutController().submit(item,qty);$('total').textContent=money(out.total);$('trace').textContent='1. UI → CheckoutController.submit(item, '+qty+')\n2. Controller creates a new Order for this request.\n3. Order.addLine() → new OrderLine('+item.price+', '+qty+') [Creator]\n4. Order.total() → line.subtotal() = '+out.total+' [Expert]\n5. Controller returns the total to the UI.';$('result').textContent='The controller coordinates. Order creates its line and calculates through the information it owns.';$('result').className='feedback good';});
  }

  const reviewCases = [
    {text:'A game must expose one controlled local race session to several systems.',answer:'Singleton',reason:'The stated requirement is one controlled shared instance.'},
    {text:'A café app constructs drinks through explicit size, milk and extras steps before returning the finished drink.',answer:'Builder',reason:'The pressure is step-by-step construction of a configurable product.'},
    {text:'EmailCampaign and SmsCampaign inherit one workflow, but each subclass creates a different sender product.',answer:'Factory Method',reason:'A subclass overrides the product-creation operation used by the shared workflow.'},
    {text:'A student screen needs one reserve() operation to coordinate several event-booking services.',answer:'Facade',reason:'The client needs a simpler entry into a complex subsystem.'},
    {text:'Checkout expects charge(riyals), while a useful provider offers debitHalalas(halalas).',answer:'Adapter',reason:'A wrapper must translate an incompatible interface and request format.'},
    {text:'Several subscribed displays must be notified whenever a university shuttle changes status.',answer:'Observer',reason:'A publisher distributes change notifications to current subscribers.'},
    {text:'A Reserve system event arrives from the study-room booking screen. Who should receive and coordinate it?',answer:'GRASP Controller',reason:'A non-UI controller receives the system event and coordinates the use case.'},
    {text:'OrderLine already holds quantity and price. Which guideline puts subtotal() in OrderLine?',answer:'Information Expert',reason:'The object with the required information owns the calculation.'},
    {text:'Order contains order lines and has their item, price and quantity. Which guideline makes it responsible for constructing a line?',answer:'GRASP Creator',reason:'Containment and initialization data support the creation responsibility.'}
  ];
  function review(root) {
    const $=id=>root.querySelector('#'+id);
    let index=0;
    root.querySelector('.body').innerHTML='<div class="progress" id="progress"></div><div class="case" id="case"></div><div class="controls">'+select('answer','Best-fitting pattern',[['','Choose a pattern'],...reviewCases.map(c=>[c.answer,c.answer])])+button('check','Check reasoning',true)+button('next','Next scenario')+'</div><div class="feedback" id="result" role="status" aria-live="polite">Choose the pattern for the stated design pressure.</div>';
    function draw(){const c=reviewCases[index];$('progress').textContent='Scenario '+(index+1)+' of '+reviewCases.length;$('case').textContent=c.text;$('answer').value='';$('result').textContent='Choose the pattern for the stated design pressure.';$('result').className='feedback';}
    $('check').addEventListener('click',()=>{const choice=$('answer').value;if(!choice){$('result').textContent='Choose a pattern first.';$('result').className='feedback warn';return;}const c=reviewCases[index];const correct=choice===c.answer;$('result').textContent=(correct?'Correct. ':'Best fit: '+c.answer+'. ')+c.reason;$('result').className='feedback '+(correct?'good':'warn');});
    $('next').addEventListener('click',()=>{index=(index+1)%reviewCases.length;draw();});
    draw();
  }
  function foundations(root) {
    const $=id=>root.querySelector('#'+id);
    const cases=[
      {text:'Create a café drink through configurable construction steps.',family:'Creational',pattern:'Builder'},
      {text:'Wrap a payment provider so it matches the checkout interface.',family:'Structural',pattern:'Adapter'},
      {text:'Notify subscribed shuttle displays when the bus status changes.',family:'Behavioral',pattern:'Observer'}
    ];
    let index=0;
    root.querySelector('.body').innerHTML='<div class="progress" id="progress"></div><div class="case" id="case"></div><div class="controls">'+select('family','Pattern family',[['','Choose family'],['Creational','Creational'],['Structural','Structural'],['Behavioral','Behavioral']])+button('match','Match the family',true)+button('next','Next problem')+'</div>'+flow([node('Creation','How should an object be constructed?'),node('Connections','How should components fit together?'),node('Interaction','How should objects react to changes?')])+'<div class="feedback" id="result" role="status" aria-live="polite">Identify the design pressure before naming a pattern.</div>';
    function draw(){$('case').textContent=cases[index].text;$('progress').textContent='Problem '+(index+1)+' of 3';$('family').value='';$('result').textContent='Identify the design pressure before naming a pattern.';$('result').className='feedback';}
    $('match').addEventListener('click',()=>{if(!$('family').value){$('result').textContent='Choose a family first.';$('result').className='feedback warn';return;}const c=cases[index];const good=$('family').value===c.family;$('result').textContent=(good?'Correct. ':c.family+' is the best family. ')+c.pattern+' is a fitting pattern for this problem.';$('result').className='feedback '+(good?'good':'warn');});
    $('next').addEventListener('click',()=>{index=(index+1)%cases.length;draw();});
    draw();
  }

  function mount() {
    const key=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'');
    const data=definitions[key];
    const article=document.querySelector('article.content');
    if(!data||!article||document.getElementById('topic11-practice'))return;
    const section=document.createElement('section');
    section.id='topic11-practice';
    section.className='section';
    const heading=document.createElement('h2');
    heading.textContent=data.title;
    section.append(heading);
    const host=document.createElement('div');
    section.append(host);
    const root=host.attachShadow({mode:'open'});
    root.innerHTML='<link rel="stylesheet" href="topic11-practice.css?v='+version+'"><p class="scenario">'+escape(data.scenario)+'</p><div class="workbench"><div class="toolbar"><div><div class="eyebrow">Try the design</div><div class="subtitle">'+escape(data.label)+'</div></div><span class="minor">Local teaching simulation</span></div><div class="body"></div>'+(data.question?'<div class="check"><div class="question">'+escape(data.question)+'</div><div class="answer">'+data.choices.map((choice,i)=>'<button type="button" class="btn" data-choice="'+i+'">'+escape(choice)+'</button>').join('')+'</div><p class="quiz-feedback" aria-live="polite"></p></div>':'')+'</div><p class="takeaway"><b>Keep this idea.</b> '+escape(data.takeaway)+'</p>';
    data.run(root);
    if(data.question)root.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
      const correct=Number(b.dataset.choice)===data.correct;
      root.querySelector('.quiz-feedback').textContent=correct?data.answer:'Reconsider the responsibility shown in the example. '+data.answer;
      root.querySelectorAll('[data-choice]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===b)));
    }));
    const navigation=article.querySelector('.lesson-nav');
    if(navigation)navigation.before(section);else article.append(section);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0),{once:true});
  else setTimeout(mount,0);
  window.addEventListener('load',()=>setTimeout(mount,0),{once:true});
})();
